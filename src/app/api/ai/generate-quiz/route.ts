/**
 * Hybrid: grounded on marketplace `Lesson` content today.
 * TODO (AI-first): generate from `Topic` / `TopicNote` and write to `TopicQuestionBank`.
 * See docs/AI_FIRST_MIGRATION.md
 */
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getAuthFromRequest } from '@/lib/auth';
import { connectToDB } from '@/lib/db';

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

function parseGeneratedQuestions(raw: string): GeneratedQuestion[] | null {
  try {
    const trimmed = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const out: GeneratedQuestion[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).question === 'string' &&
        Array.isArray((item as Record<string, unknown>).options) &&
        typeof (item as Record<string, unknown>).correctAnswer === 'string'
      ) {
        const q = item as { question: string; options: unknown[]; correctAnswer: string };
        const options = q.options.filter((o): o is string => typeof o === 'string');
        if (options.length >= 2 && options.includes(q.correctAnswer)) {
          out.push({ question: q.question, options, correctAnswer: q.correctAnswer });
        }
      }
    }
    return out.length >= 1 ? out : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.userId;

    const body = await req.json().catch(() => ({}));
    const lessonId = body?.lessonId;

    if (!lessonId) {
      return NextResponse.json(
        { message: 'Missing lessonId' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[AI Generate Quiz] OPENAI_API_KEY is not set');
      return NextResponse.json(
        { message: 'AI service is not configured' },
        { status: 503 }
      );
    }

    await connectToDB();

    const Lesson = (await import('@/models/Lesson')).default;
    const Course = (await import('@/models/Course')).default;
    const Quiz = (await import('@/models/Quiz')).default;

    const lessonDoc = await Lesson.findById(lessonId).lean();
    if (!lessonDoc) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    const lesson = lessonDoc as unknown as {
      courseId: unknown;
      title?: string;
      content?: string;
    };
    const courseId = lesson.courseId?.toString?.() ?? lesson.courseId;

    const courseDoc = await Course.findById(courseId).lean();
    if (!courseDoc) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    const course = courseDoc as unknown as {
      teacherId?: unknown;
      enrolledStudents?: unknown[];
    };
    const teacherId = course.teacherId?.toString?.() ?? String(course.teacherId);
    const enrolledIds = (course.enrolledStudents ?? []).map((id: unknown) =>
      id?.toString?.() ?? String(id)
    );
    const isTeacher = teacherId === userId;
    const isEnrolled = enrolledIds.includes(userId);
    if (!isTeacher && !isEnrolled) {
      return NextResponse.json(
        { message: 'You must be the course teacher or an enrolled student to generate a quiz for this lesson' },
        { status: 403 }
      );
    }

    const lessonContent = (lesson.content ?? '').trim() || '(No lesson content)';
    const lessonTitle = (lesson.title ?? 'Untitled').trim();

    const systemPrompt = `You are a quiz generator. Given lesson content, produce exactly 5 multiple choice questions.
Output ONLY a valid JSON array, no other text. Each element must have:
- "question": string (clear question text)
- "options": array of exactly 4 strings (possible answers)
- "correctAnswer": string (must be exactly one of the values in "options")

Example format:
[{"question":"...","options":["A","B","C","D"],"correctAnswer":"B"}, ...]`;

    const userPrompt = `Lesson title: ${lessonTitle}\n\nContent:\n${lessonContent}\n\nGenerate 5 multiple choice questions based on this lesson. Return only the JSON array.`;

    const openaiRes: Response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_QUIZ_MODEL || process.env.OPENAI_TUTOR_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0.4,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error('[AI Generate Quiz] OpenAI API error', openaiRes.status, errBody);
      return NextResponse.json(
        { message: 'AI service temporarily unavailable' },
        { status: 502 }
      );
    }

    const data = (await openaiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error?.message) {
      console.error('[AI Generate Quiz] OpenAI error payload', data.error);
      return NextResponse.json(
        { message: 'AI service error' },
        { status: 502 }
      );
    }

    const rawContent = data.choices?.[0]?.message?.content?.trim() ?? '';
    const questions = parseGeneratedQuestions(rawContent);
    if (!questions || questions.length === 0) {
      console.error('[AI Generate Quiz] Invalid or no questions from OpenAI', rawContent.slice(0, 200));
      return NextResponse.json(
        { message: 'Could not generate valid quiz; please try again' },
        { status: 502 }
      );
    }

    const toSave = questions.slice(0, 5).map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    const quizDoc = await Quiz.create({
      lessonId,
      questions: toSave,
    });

    const quiz = {
      _id: quizDoc._id.toString(),
      lessonId: quizDoc.lessonId.toString(),
      questions: quizDoc.questions,
      createdAt: (quizDoc as { createdAt?: Date }).createdAt,
    };

    return NextResponse.json(quiz);
  } catch (err) {
    console.error('[AI Generate Quiz] Unexpected error', err);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
