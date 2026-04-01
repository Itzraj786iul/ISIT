/** Helpers for GET /api/teacher/student-insights — bounded scores and alert copy. */

export const INSIGHTS_RECENT_DAYS = 30;

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** More confusion logs in the window → higher score (0–100). ~15 logs ≈ max. */
export function confusionScoreFromCount(count: number): number {
  return clamp(Math.round((count / 15) * 100), 0, 100);
}

/** Sessions and telemetry events in scope → engagement (0–100). */
export function engagementScoreFromCounts(sessionCount: number, eventCount: number): number {
  const raw = sessionCount * 9 + Math.min(eventCount, 250) * 0.12;
  return clamp(Math.round(raw), 0, 100);
}

export function needsAttention(avgMastery: number, weakTopicCount: number, confusionScore: number): boolean {
  return avgMastery < 50 || weakTopicCount >= 2 || confusionScore >= 60;
}

export function isStrugglingForOverview(avgMastery: number, weakTopicCount: number): boolean {
  return avgMastery < 50 || weakTopicCount >= 2;
}
