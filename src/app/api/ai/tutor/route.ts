import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAuthFromRequest } from '@/lib/auth';

dotenv.config();

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
    await mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  }
};

type TutorUsageLog = {
  userId: string;
  lessonId: string;
  questionLength: number;
  answerLength: number;
  timestamp: string;
};

function logTutorUsage(log: TutorUsageLog): void {
  const payload = {
    ...log,
    type: 'ai_tutor_usage',
  };
  console.info('[AI Tutor Usage]', JSON.stringify(payload));
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
    const userQuestion = typeof body?.userQuestion === 'string' ? body.userQuestion.trim() : '';

    if (!lessonId) {
      return NextResponse.json(
        { message: 'Missing lessonId' },
        { status: 400 }
      );
    }
    if (!userQuestion) {
      return NextResponse.json(
        { message: 'Missing or empty userQuestion' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[AI Tutor] OPENAI_API_KEY is not set');
      return NextResponse.json(
        { message: 'AI service is not configured' },
        { status: 503 }
      );
    }

    await connectToDB();

    const Lesson = (await import('@/models/Lesson')).default;
    const Course = (await import('@/models/Course')).default;

    const lessonDoc = await Lesson.findById(lessonId).lean();
    if (!lessonDoc) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    // Assert shape for TS (Mongoose .lean() typings are loose)
    const lesson = lessonDoc as unknown as { courseId: unknown; title?: string; content?: string };
    const courseId = lesson.courseId?.toString?.() ?? lesson.courseId;

    const courseDoc = await Course.findById(courseId).lean();
    if (!courseDoc) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    const course = courseDoc as unknown as { enrolledStudents?: unknown[] };
    const enrolledIds = (course.enrolledStudents ?? []).map((id: unknown) =>
      id?.toString?.() ?? String(id)
    );
    const isEnrolled = enrolledIds.includes(userId);
    if (!isEnrolled) {
      return NextResponse.json(
        { message: 'You must be enrolled in this course to use the tutor for this lesson' },
        { status: 403 }
      );
    }

    const lessonContent = (lesson.content ?? '').trim() || '(No lesson content)';
    const systemContent = `You are a helpful tutor. Answer the student's question based on the following lesson content. Stay on topic, clear, and concise. If the question is not related to the lesson, politely steer back to the material.`;

    const messages: { role: 'system' | 'user'; content: string }[] = [
      { role: 'system', content: systemContent },
      {
        role: 'user',
        content: `## Lesson: ${(lesson.title ?? 'Untitled').trim()}\n\n${lessonContent}\n\n---\n\n## Student question:\n${userQuestion}`,
      },
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TUTOR_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 1024,
        temperature: 0.5,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error('[AI Tutor] OpenAI API error', openaiRes.status, errBody);
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
      console.error('[AI Tutor] OpenAI error payload', data.error);
      return NextResponse.json(
        { message: 'AI service error' },
        { status: 502 }
      );
    }

    const answer =
      data.choices?.[0]?.message?.content?.trim() ??
      'Sorry, I could not generate an answer. Please try again.';

    logTutorUsage({
      userId,
      lessonId: String(lessonId),
      questionLength: userQuestion.length,
      answerLength: answer.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[AI Tutor] Unexpected error', err);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
