/** Helpers for parent-facing learning insights (7-day window, plain language). */

import { log } from '@/lib/logger';

export const PARENT_ACTIVITY_DAYS = 7;

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Compare this week vs previous week session counts. */
export function improvementTrendFromSessions(sessionsThisWeek: number, sessionsPriorWeek: number): 'up' | 'down' | 'steady' {
  if (sessionsPriorWeek === 0 && sessionsThisWeek >= 2) return 'up';
  if (sessionsPriorWeek === 0) return 'steady';
  if (sessionsThisWeek > sessionsPriorWeek * 1.2) return 'up';
  if (sessionsThisWeek < sessionsPriorWeek * 0.8) return 'down';
  return 'steady';
}

/** 0–100 from weekly sessions + events (soft signal for parents). */
export function parentEngagementScore(sessionCount: number, eventCount: number): number {
  const raw = sessionCount * 14 + Math.min(eventCount, 120) * 0.2;
  return clamp(Math.round(raw), 0, 100);
}

export function engagementLabel(score: number): string {
  if (score >= 55) return 'Very active this week';
  if (score >= 25) return 'Somewhat active this week';
  if (score > 0) return 'A little activity this week';
  return 'No sessions this week yet';
}

export function buildActionSuggestions(input: {
  weakLabels: string[];
  strongLabels: string[];
  recentActivity: number;
  trend: 'up' | 'down' | 'steady';
  linkedAccount: boolean;
}): string[] {
  const out: string[] = [];
  if (!input.linkedAccount) {
    out.push('When they sign in with the linked email, you will see their progress here.');
    out.push('Remind them to use the same account you added.');
    return out;
  }
  if (input.recentActivity === 0) {
    out.push('Encourage a short learning session a few times this week.');
  } else if (input.trend === 'down') {
    out.push('Gently check in—short, regular practice often helps momentum.');
  } else {
    out.push('Encourage daily practice, even in small chunks.');
  }
  if (input.weakLabels.length > 0) {
    out.push(`Spend a little extra time on ${input.weakLabels[0]}.`);
  }
  if (input.strongLabels.length > 0) {
    out.push(`Celebrate what is going well—confidence carries over.`);
  }
  return [...new Set(out)].slice(0, 4);
}

export function buildFallbackAiSummary(input: {
  childName: string;
  avgMastery: number;
  strongLabels: string[];
  weakLabels: string[];
  recentActivity: number;
  trend: 'up' | 'down' | 'steady';
  linkedAccount: boolean;
}): string {
  const { childName, avgMastery, strongLabels, weakLabels, recentActivity, trend, linkedAccount } = input;
  if (!linkedAccount) {
    return `${childName} has not started learning on this platform with the linked email yet. When they sign in and begin, you will see how they are doing and where you can cheer them on.`;
  }
  const parts: string[] = [];
  if (avgMastery >= 65) {
    parts.push(`${childName} is making solid progress overall.`);
  } else if (avgMastery >= 40) {
    parts.push(`${childName} is building skills steadily—keep encouraging the effort they put in.`);
  } else {
    parts.push(`${childName} is still getting started in several areas, and that is completely normal.`);
  }
  if (strongLabels.length) {
    const s = strongLabels.slice(0, 2).join(' and ');
    parts.push(`They are especially strong in ${s}.`);
  }
  if (weakLabels.length) {
    parts.push(`A bit of extra support in ${weakLabels[0]} can help them feel more confident.`);
  }
  if (recentActivity === 0) {
    parts.push('A few short sessions this week can make a big difference—small steps add up.');
  } else if (trend === 'up') {
    parts.push('Activity picked up compared to last week—great sign.');
  } else if (trend === 'down') {
    parts.push('Last week was a bit quieter; a gentle nudge toward practice can help them get back into a rhythm.');
  } else {
    parts.push('They are showing consistent effort—your encouragement matters.');
  }
  return parts.join(' ');
}

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

export async function generateParentInsightParagraph(input: {
  childName: string;
  avgMastery: number;
  strongTopicLabels: string[];
  weakTopicLabels: string[];
  recentActivity: number;
  trend: 'up' | 'down' | 'steady';
  linkedAccount: boolean;
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_TUTOR_MODEL || 'gpt-4o-mini';
  const payload = {
    childName: input.childName,
    senseOfOverallProgress: input.linkedAccount ? `${input.avgMastery}% approximate` : 'not yet learning on platform',
    doingWellIn: input.strongTopicLabels,
    couldUseSupportIn: input.weakTopicLabels,
    learningSessionsThisWeek: input.recentActivity,
    momentumVsPriorWeek: input.trend,
    linkedAccount: input.linkedAccount,
  };

  const messages = [
    {
      role: 'system' as const,
      content:
        'You write brief, warm updates for parents about a child\'s learning. Use simple, everyday language. Never mention confusion logs, raw analytics, or technical systems. Do not quote exact percentage scores in the text. Sound reassuring and hopeful. Exactly one short paragraph, 2–4 sentences. Address the parent as "you". No markdown.',
    },
    {
      role: 'user' as const,
      content: `Write one paragraph for the parent based on this JSON (use it only as context):\n${JSON.stringify(payload)}`,
    },
  ];

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 220,
        temperature: 0.65,
      }),
    });

    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      log.aiFailure('parent_child_insight', new Error(`HTTP ${openaiRes.status}`), { detail: detail.slice(0, 400) });
      return null;
    }

    const data = (await openaiRes.json()) as OpenAIChatResponse;
    if (data.error?.message) {
      log.aiFailure('parent_child_insight', new Error(data.error.message));
      return null;
    }
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch (e) {
    log.aiFailure('parent_child_insight', e);
    return null;
  }
}
