export type PublicSubject = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
  academic_year?: string;
  curriculum_version?: string;
};

export type PublicTopic = {
  _id: string;
  topic_name: string;
  topic_description?: string;
  difficulty_level?: string;
  estimated_time?: number;
  topic_order?: number;
  learning_objectives?: string[];
  key_concepts?: string[];
};

export const SUBJECT_CARD_GRADIENTS = [
  'from-violet-700 via-purple-600 to-fuchsia-500',
  'from-sky-700 via-blue-600 to-cyan-400',
  'from-emerald-700 via-teal-600 to-green-400',
  'from-orange-600 via-rose-500 to-amber-400',
  'from-indigo-700 via-violet-600 to-blue-500',
  'from-rose-600 via-pink-500 to-fuchsia-400',
] as const;
