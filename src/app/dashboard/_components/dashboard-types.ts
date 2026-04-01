export type LastSessionPayload = {
  session_id?: string;
  topic_id: string;
  subject_id: string;
  start_time: string;
};

export type SubjectItem = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
};

export type MasteryRecord = {
  _id?: string;
  topic_id: string;
  mastery_score: number;
  attempt_count: number;
  correct_answers: number;
  last_updated?: string;
};

export type PerformanceMetricRow = {
  learning_time_minutes?: number;
  topics_completed?: number;
  month?: string;
  avg_mastery?: number;
};

export type RecommendationItem = {
  topicId: string | null;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export type WeakAreaItem = {
  topicId: string;
  name: string;
  score: number;
};
