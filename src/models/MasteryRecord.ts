import mongoose from 'mongoose';

const MasteryRecordSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    mastery_score: { type: Number, default: 0 },
    confidence_score: { type: Number, default: 0 },
    correct_answers: { type: Number, default: 0 },
    teachback_average: { type: Number },
    engagement_score: { type: Number },
    revision_needed: { type: Boolean, default: false },
    attempt_count: { type: Number, default: 0 },
    last_session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    last_updated: { type: Date, default: () => new Date() },
  },
  { timestamps: true, collection: 'mastery_records' }
);

MasteryRecordSchema.index({ organization_id: 1, student_id: 1, topic_id: 1 }, { unique: true });
MasteryRecordSchema.index({ organization_id: 1, student_id: 1 });
MasteryRecordSchema.index({ organization_id: 1, topic_id: 1 });
MasteryRecordSchema.index({ student_id: 1 });
MasteryRecordSchema.index({ topic_id: 1 });
MasteryRecordSchema.index({ student_id: 1, topic_id: 1 });

export default mongoose.models.MasteryRecord || mongoose.model('MasteryRecord', MasteryRecordSchema);
