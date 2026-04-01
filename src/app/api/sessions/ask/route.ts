/**
 * Adaptive AI tutor — uses session events + mastery, Socratic prompts, teachback, difficulty tracking.
 */
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import {
  getSessionDocumentById,
  getEventsForSession,
  createSessionEvent,
  getMasteryRecord,
  type SessionEventType,
} from '@/lib/learning-execution';
import { getTopicById } from '@/lib/curriculum-api';
import { getTopicNotesForTopic } from '@/lib/content-layer';
import { successResponse, errorResponse } from '@/lib/api-response';
import { log } from '@/lib/logger';
import {
  classifyStudentMessage,
  streaksFromAnswerEvents,
  difficultyFromMastery,
  adaptDifficultyFromStreaks,
  mergeBaselineAndStored,
  quickActionMessage,
  buildSocraticSystemLayer,
  parseTeachbackJson,
  type TutorDifficulty,
} from '@/lib/tutor-adaptive';

async function logTutorEvent(
  orgId: mongoose.Types.ObjectId,
  sessionId: string,
  studentId: string,
  eventType: SessionEventType,
  content?: string,
  metadata?: unknown
) {
  try {
    await createSessionEvent({
      organization_id: orgId,
      session_id: new mongoose.Types.ObjectId(sessionId),
      student_id: new mongoose.Types.ObjectId(studentId),
      event_type: eventType,
      content,
      metadata,
    });
  } catch (e) {
    log.apiError('POST /api/sessions/ask tutor_event', e);
  }
}

async function callOpenAI(
  apiKey: string,
  systemContent: string,
  userContent: string,
  options?: { maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const body: Record<string, unknown> = {
    model: process.env.OPENAI_TUTOR_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ],
    max_tokens: options?.maxTokens ?? 1024,
    temperature: 0.45,
  };
  if (options?.jsonMode) {
    body.response_format = { type: 'json_object' };
  }
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    log.aiFailure('sessions/ask_openai', new Error(`HTTP ${openaiRes.status}`), { detail: errBody.slice(0, 500) });
    throw new Error('openai_failed');
  }
  const data = (await openaiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return (
    data.choices?.[0]?.message?.content?.trim() ??
    'Sorry, I could not generate an answer. Please try again.'
  );
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId ?? body.session_id;
    let message = typeof body.message === 'string' ? body.message.trim() : '';
    let tab = typeof body.tab === 'string' ? body.tab : 'explain';
    const phase = typeof body.phase === 'string' ? body.phase : 'normal';
    const quickAction =
      body.quickAction ??
      body.quick_action;

    if (!sessionId) return errorResponse('sessionId is required', 400);

    const sessionDoc = await getSessionDocumentById(sessionId);
    if (!sessionDoc) return errorResponse('Session not found', 404);
    const sess = sessionDoc as unknown as {
      student_id?: unknown;
      topic_id?: unknown;
      organization_id?: unknown;
      tutor_current_concept?: string;
      tutor_difficulty_level?: TutorDifficulty;
      tutor_consecutive_wrong?: number;
      tutor_consecutive_correct?: number;
      teachback_score?: number;
    };
    if (String(sess.student_id) !== auth.userId) return errorResponse('Forbidden', 403);

    const orgId = sess.organization_id as mongoose.Types.ObjectId;
    const topicId = sess.topic_id?.toString?.() ?? String(sess.topic_id);
    const topic = await getTopicById(topicId);
    if (!topic) return errorResponse('Topic not found', 404);

    const topicLean = topic as unknown as {
      topic_name?: string;
      topic_description?: string;
      learning_objectives?: string[];
      organization_id?: unknown;
    };
    const topicOrg = topicLean.organization_id ?? orgId;
    const topicName = topicLean.topic_name ?? 'this topic';

    const notes = await getTopicNotesForTopic(topicId, { approvedOnly: true });
    const notesText = (notes as { content_markdown?: string; note_type?: string }[])
      .slice(0, 5)
      .map((n) => `### ${n.note_type ?? 'note'}\n${(n.content_markdown ?? '').slice(0, 4000)}`)
      .join('\n\n');

    const contextBlock = [
      `Topic: ${topicName}`,
      topicLean.topic_description ? `Description: ${topicLean.topic_description}` : '',
      topicLean.learning_objectives?.length
        ? `Objectives: ${topicLean.learning_objectives.join('; ')}`
        : '',
      notesText ? `Approved notes:\n${notesText}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return errorResponse('AI service is not configured', 503);
    }

    if (
      quickAction === 'hint' ||
      quickAction === 'explain_again' ||
      quickAction === 'test_me'
    ) {
      const q = quickActionMessage(quickAction, topicName);
      message = q.message;
      tab = q.tab;
    }

    if (phase === 'teachback_invite') {
      const systemContent = `You are a warm ISIT tutor. Invite the student to explain "${topicName}" in their own words (2–5 sentences). Do not grade them yet—only ask clearly and encourage them. One short paragraph.`;
      const userContent = `## Context\n${contextBlock || '(No extra notes)'}\n\nAsk the student to teach back the main idea.`;
      let answer: string;
      try {
        answer = await callOpenAI(apiKey, systemContent, userContent, { maxTokens: 400 });
      } catch {
        return errorResponse('AI service temporarily unavailable', 502);
      }
      await logTutorEvent(orgId, sessionId, auth.userId, 'explanation_given', 'teachback_invite', {
        topic_id: topicId,
      });
      return successResponse(
        { message: answer, answer, phase: 'teachback_invite', adaptive: { difficulty: sess.tutor_difficulty_level ?? 'medium' } },
        200
      );
    }

    if (phase === 'teachback_submit') {
      if (!message) return errorResponse('message is required for teachback submission', 400);
      const systemContent = `You evaluate a student's own-words explanation of "${topicName}". 
Respond with ONLY a JSON object: {"score": <0-100 integer>, "feedback": "<2-4 sentences constructive feedback>"}.
Score reflects conceptual accuracy and clarity, not grammar.`;
      const userContent = `## Topic context\n${contextBlock}\n\n## Student explanation\n${message}`;
      let raw: string;
      try {
        raw = await callOpenAI(apiKey, systemContent, userContent, { maxTokens: 500, jsonMode: true });
      } catch {
        try {
          raw = await callOpenAI(apiKey, `${systemContent}\nOutput valid JSON only.`, userContent, {
            maxTokens: 500,
          });
        } catch {
          return errorResponse('AI service temporarily unavailable', 502);
        }
      }
      const parsed = parseTeachbackJson(raw);
      const score = parsed?.score ?? 0;
      const feedback =
        parsed?.feedback ??
        'Thanks for explaining. Keep practicing connecting ideas to examples.';

      const prevTb = typeof sess.teachback_score === 'number' ? sess.teachback_score : 0;
      const nextTb = Math.max(prevTb, score);
      (sessionDoc as { teachback_score?: number }).teachback_score = nextTb;
      await sessionDoc.save();

      await logTutorEvent(orgId, sessionId, auth.userId, 'teachback_attempt', message.slice(0, 2000), {
        score,
        topic_id: topicId,
      });

      const display = `**Teachback score: ${score}/100**\n\n${feedback}`;
      return successResponse(
        {
          message: display,
          answer: display,
          teachback_score: score,
          phase: 'teachback_submit',
          adaptive: { difficulty: sess.tutor_difficulty_level ?? 'medium' },
        },
        200
      );
    }

    if (!message) return errorResponse('message is required', 400);

    const events = await getEventsForSession(sessionId);
    const { wrongStreak, correctStreak, lastCorrect } = streaksFromAnswerEvents(
      events as { event_type?: string; is_correct?: unknown }[]
    );

    const masteryRec = await getMasteryRecord(auth.userId, topicId, topicOrg as mongoose.Types.ObjectId);
    const masteryScore = (masteryRec as { mastery_score?: number } | null)?.mastery_score ?? 0;
    const baseline = difficultyFromMastery(masteryScore);
    const stored = sess.tutor_difficulty_level as TutorDifficulty | undefined;
    const merged = mergeBaselineAndStored(baseline, stored);
    const adapted = adaptDifficultyFromStreaks(merged, wrongStreak, correctStreak);

    let mode = classifyStudentMessage(message);
    if (wrongStreak >= 2) mode = 'confused';

    const concept = (sess.tutor_current_concept || '').trim() || topicName;

    const socratic = buildSocraticSystemLayer(mode, adapted, tab);

    const tabHint =
      tab === 'hint'
        ? 'You are in HINT mode: one nudge only; prefer a question that unlocks the next step.'
        : tab === 'quiz'
          ? 'You are in TEST ME mode: challenge with Socratic questions; do not reveal the full solution immediately.'
          : 'You are in EXPLAIN mode: teach through guided questions and steps.';

    const systemContent = `You are an adaptive AI tutor for ISIT (Intelligent Student Instruction Tool).
${tabHint}

${socratic}

Stay on-topic using the context below. If the question is off-topic, steer back gently.`;

    const userContent = `## Context\n${contextBlock || '(No extra notes)'}\n\nCurrent focus concept: "${concept}"\nStudent proficiency band: ${adapted} (from mastery ~${masteryScore}% and recent practice).\n\n## Student message\n${message}`;

    let answer: string;
    try {
      answer = await callOpenAI(apiKey, systemContent, userContent);
    } catch {
      return errorResponse('AI service temporarily unavailable', 502);
    }

    (sessionDoc as { tutor_difficulty_level?: string }).tutor_difficulty_level = adapted;
    (sessionDoc as { tutor_consecutive_wrong?: number }).tutor_consecutive_wrong = wrongStreak;
    (sessionDoc as { tutor_consecutive_correct?: number }).tutor_consecutive_correct = correctStreak;
    if (lastCorrect !== null) {
      (sessionDoc as { tutor_last_answer_correct?: boolean }).tutor_last_answer_correct = lastCorrect;
    }
    (sessionDoc as { tutor_current_concept?: string }).tutor_current_concept = concept;

    await sessionDoc.save();

    if (adapted !== merged) {
      await logTutorEvent(orgId, sessionId, auth.userId, 'difficulty_changed', adapted, {
        from: merged,
        to: adapted,
        wrongStreak,
        correctStreak,
      });
    }

    if (quickAction === 'hint') {
      await logTutorEvent(orgId, sessionId, auth.userId, 'hint_given', message.slice(0, 500), {
        quickAction: true,
      });
    } else if (tab === 'hint') {
      await logTutorEvent(orgId, sessionId, auth.userId, 'hint_given', message.slice(0, 500), {
        quickAction: false,
      });
    }

    if (quickAction === 'explain_again') {
      await logTutorEvent(orgId, sessionId, auth.userId, 'explanation_given', message.slice(0, 500), {
        mode,
        quickAction: true,
      });
    } else if (tab === 'explain' && mode === 'confused') {
      await logTutorEvent(orgId, sessionId, auth.userId, 'explanation_given', message.slice(0, 500), {
        mode,
        simplified: true,
      });
    }

    return successResponse(
      {
        message: answer,
        answer,
        adaptive: {
          difficulty: adapted,
          mode,
          mastery_score: masteryScore,
          wrong_streak: wrongStreak,
          correct_streak: correctStreak,
        },
      },
      200
    );
  } catch (error) {
    log.apiError('POST /api/sessions/ask', error);
    return errorResponse('Internal Server Error', 500);
  }
}
