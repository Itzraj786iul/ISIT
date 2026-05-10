export type AssignedTopicListItem = {
  assignment_id: string;
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  status: string;
  due_date: string | null;
  mastery_score: number | null;
  source: 'direct' | 'class';
  /** From `AssignedTopicProgress` when present */
  started_at?: string | null;
  completed_at?: string | null;
};
