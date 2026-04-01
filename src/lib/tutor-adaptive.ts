/**
 * Heuristics + rules for adaptive AI tutor (sessions/ask). No ML — session events + mastery only.
 */

export type TutorDifficulty = 'easy' | 'medium' | 'hard';

export type MessageMode = 'explanation' | 'evaluation' | 'confused';

export function classifyStudentMessage(message: string): MessageMode {
  const t = message.trim();
  if (!t) return 'explanation';
  const m = t.toLowerCase();
  if (
    /\b(confus|don't understand|dont understand|not sure|stuck|lost|no idea)\b/i.test(m) ||
    /\b(huh|what do you mean)\b/i.test(m)
  ) {
    return 'confused';
  }
  if (/^(yes|no)\b|^true|false$/i.test(t)) return 'evaluation';
  if (/^\(?[a-d]\)?$/i.test(t)) return 'evaluation';
  if (/^(my answer|the answer is|i think|it is|it's|answer:?)\s/i.test(m)) return 'evaluation';
  if (/\d/.test(t) && t.length < 48 && !/\?/.test(t)) return 'evaluation';
  return 'explanation';
}

export function streaksFromAnswerEvents(
  events: Array<{ event_type?: string; is_correct?: unknown }>
): { wrongStreak: number; correctStreak: number; lastCorrect: boolean | null } {
  const answers = events.filter(
    (e) => e.event_type === 'answer' && typeof (e as { is_correct?: unknown }).is_correct === 'boolean'
  ) as { is_correct: boolean }[];
  if (answers.length === 0) return { wrongStreak: 0, correctStreak: 0, lastCorrect: null };
  const last = answers[answers.length - 1].is_correct;
  let streak = 0;
  for (let i = answers.length - 1; i >= 0; i--) {
    if (answers[i].is_correct === last) streak += 1;
    else break;
  }
  return {
    lastCorrect: last,
    wrongStreak: last === false ? streak : 0,
    correctStreak: last === true ? streak : 0,
  };
}

export function difficultyFromMastery(masteryScore: number): TutorDifficulty {
  if (masteryScore < 40) return 'easy';
  if (masteryScore <= 70) return 'medium';
  return 'hard';
}

function stepDown(d: TutorDifficulty): TutorDifficulty {
  if (d === 'hard') return 'medium';
  return 'easy';
}

function stepUp(d: TutorDifficulty): TutorDifficulty {
  if (d === 'easy') return 'medium';
  if (d === 'medium') return 'hard';
  return 'hard';
}

/** Live adaptation from recent answer streaks (after merging with stored / mastery baseline). */
export function adaptDifficultyFromStreaks(
  current: TutorDifficulty,
  wrongStreak: number,
  correctStreak: number
): TutorDifficulty {
  let d = current;
  if (wrongStreak >= 2) d = stepDown(d);
  if (correctStreak >= 2) d = stepUp(d);
  return d;
}

export function mergeBaselineAndStored(
  masteryBaseline: TutorDifficulty,
  stored: TutorDifficulty | undefined | null
): TutorDifficulty {
  return stored && ['easy', 'medium', 'hard'].includes(stored) ? stored : masteryBaseline;
}

export type QuickAction = 'hint' | 'explain_again' | 'test_me';

export function quickActionMessage(action: QuickAction, topicName: string): { message: string; tab: string } {
  switch (action) {
    case 'hint':
      return {
        message: `Give me a helpful hint about "${topicName}" without revealing the full solution. One short step is enough.`,
        tab: 'hint',
      };
    case 'explain_again':
      return {
        message: `Explain the main idea of "${topicName}" again in simpler language, using a quick example.`,
        tab: 'explain',
      };
    case 'test_me':
      return {
        message: `Test my understanding of "${topicName}" with one challenging question. Do not give the answer yet—guide me with a Socratic question first.`,
        tab: 'quiz',
      };
    default:
      return { message: '', tab: 'explain' };
  }
}

export function buildSocraticSystemLayer(
  mode: MessageMode,
  difficulty: TutorDifficulty,
  tab: string
): string {
  const diffLine =
    difficulty === 'easy'
      ? 'Use short sentences, concrete examples, and minimal jargon.'
      : difficulty === 'medium'
        ? 'Balance intuition and precision; connect ideas across steps.'
        : 'Expect tighter reasoning; ask the student to justify steps and edge cases.';

  const modeLine =
    mode === 'confused'
      ? 'The student seems confused: simplify, define terms, and ask ONE small sub-question before going deeper.'
      : mode === 'evaluation'
        ? 'The student may be answering or checking work: acknowledge briefly, judge reasoning (not just the final value), then ask one follow-up that deepens understanding.'
        : 'The student is exploring or asking: prefer guiding questions over dumping full answers.';

  const tabLine =
    tab === 'hint'
      ? 'Hint mode: offer at most one nudge; do not reveal the complete answer unless they are still stuck after your question.'
      : tab === 'quiz'
        ? 'Quiz / test mode: use Socratic questioning; avoid giving away the answer immediately.'
        : 'Explain mode: teach through questions and steps; only state conclusions after the student has reasoned along.';

  return `Adaptive tutor rules:\n- ${diffLine}\n- ${modeLine}\n- ${tabLine}\n- Prefer Socratic dialogue: break problems into steps, ask "what if" and "why" questions, and encourage the student to think aloud. Avoid replying with only a bare final answer (e.g. just "5") unless the student explicitly asks for verification of a specific value they stated.`;
}

export function parseTeachbackJson(raw: string): { score: number; feedback: string } | null {
  const t = raw.trim();
  const jsonMatch = t.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const o = JSON.parse(jsonMatch[0]) as { score?: unknown; feedback?: unknown };
    const score = typeof o.score === 'number' && Number.isFinite(o.score) ? Math.max(0, Math.min(100, Math.round(o.score))) : null;
    const feedback = typeof o.feedback === 'string' ? o.feedback.trim() : '';
    if (score == null) return null;
    return { score, feedback: feedback || 'Thanks for explaining.' };
  } catch {
    return null;
  }
}
