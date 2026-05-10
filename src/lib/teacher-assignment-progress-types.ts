import type { AssignmentLifecycleStatus } from '@/lib/assignment-lifecycle';

export type AssignmentProgressStudentRow = {
  student_id: string;
  name: string;
  status: AssignmentLifecycleStatus;
  mastery_score: number | null;
  started_at: string | null;
  completed_at: string | null;
};

export type AssignmentProgressPayload = {
  topic_name: string;
  subject_name: string;
  total_students: number;
  not_started: number;
  in_progress: number;
  completed: number;
  students: AssignmentProgressStudentRow[];
};
