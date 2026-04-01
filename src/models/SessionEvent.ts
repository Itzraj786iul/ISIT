import mongoose from 'mongoose';

const EVENT_TYPES = [
  'question',
  'answer',
  'pause',
  'rewind',
  'play',
  'hint_request',
  'teachback',
  'teachback_attempt',
  'hint_given',
  'explanation_given',
  'difficulty_changed',
  'session_end',
  'start_learning_click',
] as const;

const SessionEventSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event_type: { type: String, enum: EVENT_TYPES, required: true },
    content: { type: String },
    response_time_ms: { type: Number },
    is_correct: { type: Boolean },
    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: () => new Date() },
  },
  { timestamps: true, collection: 'session_events' }
);

SessionEventSchema.index({ organization_id: 1, session_id: 1 });
SessionEventSchema.index({ organization_id: 1, student_id: 1 });
SessionEventSchema.index({ session_id: 1 });
SessionEventSchema.index({ student_id: 1 });
SessionEventSchema.index({ session_id: 1, timestamp: 1 });

export default mongoose.models.SessionEvent || mongoose.model('SessionEvent', SessionEventSchema);
