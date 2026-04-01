/**
 * AI-first learning attempt — links student + `Topic` + `Subject`. Events → Mastery → recommendations.
 * See docs/AI_FIRST_MIGRATION.md
 */
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    mode: { type: String, enum: ['explorer', 'revision', 'exam'], required: true },
    ai_model_used: { type: String },
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    duration_seconds: { type: Number, default: 0 },
    confusion_count: { type: Number, default: 0 },
    teachback_score: { type: Number },
    /** Adaptive tutor state (persisted on Session). */
    tutor_current_concept: { type: String, default: '' },
    tutor_difficulty_level: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tutor_last_answer_correct: { type: Boolean },
    tutor_consecutive_wrong: { type: Number, default: 0 },
    tutor_consecutive_correct: { type: Number, default: 0 },
    completion_status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
  },
  { timestamps: true }
);

SessionSchema.index({ organization_id: 1, student_id: 1 });
SessionSchema.index({ organization_id: 1, topic_id: 1 });
SessionSchema.index({ student_id: 1 });
SessionSchema.index({ topic_id: 1 });
SessionSchema.index({ student_id: 1, start_time: -1 });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
