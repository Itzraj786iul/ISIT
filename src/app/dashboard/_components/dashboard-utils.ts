import { fetchWithAuth } from '@/lib/api-client';
import type { MasteryRecord, PerformanceMetricRow, RecommendationItem, WeakAreaItem } from './dashboard-types';

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  { topicId: null, name: 'Problem-solving strategies', difficulty: 'Medium' },
  { topicId: null, name: 'Reading for main ideas', difficulty: 'Easy' },
  { topicId: null, name: 'Working with data & charts', difficulty: 'Medium' },
];

export function scoreToDifficulty(score: number): RecommendationItem['difficulty'] {
  if (score < 40) return 'Hard';
  if (score < 65) return 'Medium';
  return 'Easy';
}

export type AssignedTopicRecInput = {
  topic_id: string;
  topic_name?: string;
  status: string;
};

/** Up to 3 picks: incomplete teacher-assigned topics first, then weaker practiced topics, padded with mocks. */
export function buildRecommendations(
  masteryRecords: MasteryRecord[],
  topicNames: Record<string, string>,
  options?: { assignedTopics?: AssignedTopicRecInput[] }
): RecommendationItem[] {
  const usedTopicIds = new Set<string>();
  const usedNames = new Set<string>();
  const out: RecommendationItem[] = [];

  const assignedIncomplete =
    options?.assignedTopics?.filter((t) => t.status !== 'completed') ?? [];
  for (const t of assignedIncomplete) {
    if (out.length >= 3) break;
    if (usedTopicIds.has(t.topic_id)) continue;
    usedTopicIds.add(t.topic_id);
    const baseName = (t.topic_name || topicNames[t.topic_id] || 'Topic').trim();
    const name = `${baseName} (assigned)`;
    usedNames.add(name);
    const rec = masteryRecords.find((r) => r.topic_id === t.topic_id);
    const score = rec?.mastery_score ?? 50;
    out.push({
      topicId: t.topic_id,
      name,
      difficulty: scoreToDifficulty(score),
    });
  }

  const fromData = masteryRecords
    .filter(
      (r) =>
        !usedTopicIds.has(r.topic_id) && r.mastery_score < 70 && r.attempt_count > 0
    )
    .sort((a, b) => a.mastery_score - b.mastery_score)
    .slice(0, 3)
    .map((r) => {
      const name = topicNames[r.topic_id] || 'Topic';
      usedNames.add(name);
      usedTopicIds.add(r.topic_id);
      return {
        topicId: r.topic_id,
        name,
        difficulty: scoreToDifficulty(r.mastery_score),
      };
    });

  for (const item of fromData) {
    if (out.length >= 3) break;
    out.push(item);
  }

  for (const m of MOCK_RECOMMENDATIONS) {
    if (out.length >= 3) break;
    if (!usedNames.has(m.name)) {
      out.push(m);
      usedNames.add(m.name);
    }
  }
  return out.slice(0, 3);
}

export function buildWeakAreas(masteryRecords: MasteryRecord[], topicNames: Record<string, string>): WeakAreaItem[] {
  return masteryRecords
    .filter((r) => r.mastery_score < 50 && r.attempt_count > 0)
    .sort((a, b) => a.mastery_score - b.mastery_score)
    .map((r) => ({
      topicId: r.topic_id,
      name: topicNames[r.topic_id] || 'Topic',
      score: r.mastery_score,
    }));
}

export function aggregatePerformance(
  metrics: PerformanceMetricRow[],
  masteryRecords: MasteryRecord[]
): { timeMinutes: number; topicsCompleted: number; masteryPercent: number } {
  let timeMinutes = 0;
  let topicsCompleted = 0;
  const avgMasterySamples: number[] = [];
  for (const m of metrics) {
    timeMinutes += m.learning_time_minutes ?? 0;
    topicsCompleted += m.topics_completed ?? 0;
    if (typeof m.avg_mastery === 'number' && m.avg_mastery > 0) avgMasterySamples.push(m.avg_mastery);
  }
  let masteryPercent = 0;
  if (avgMasterySamples.length > 0) {
    masteryPercent = avgMasterySamples.reduce((a, b) => a + b, 0) / avgMasterySamples.length;
  } else if (masteryRecords.length > 0) {
    const practiced = masteryRecords.filter((r) => r.attempt_count > 0);
    if (practiced.length > 0) {
      masteryPercent = practiced.reduce((s, r) => s + r.mastery_score, 0) / practiced.length;
    }
  }
  return { timeMinutes, topicsCompleted, masteryPercent };
}

export async function resolveTopicNames(topicIds: string[]): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  const unique = [...new Set(topicIds)].slice(0, 36);
  const names: Record<string, string> = {};
  await Promise.all(
    unique.map(async (id) => {
      try {
        const tRes = await fetchWithAuth(`/api/topics/${id}`);
        const tJson = (await tRes.json()) as { success?: boolean; data?: { topic_name?: string } };
        if (tJson.success && tJson.data?.topic_name) names[id] = tJson.data.topic_name;
      } catch {
        /* skip */
      }
    })
  );
  return names;
}
