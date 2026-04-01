import mongoose from 'mongoose';

const ConfusionLogSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    trigger_type: { type: String },
    trigger_reason: { type: String },
    timestamp: { type: Date, default: () => new Date() },
  },
  { timestamps: true, collection: 'confusion_logs' }
);

ConfusionLogSchema.index({ organization_id: 1, student_id: 1 });
ConfusionLogSchema.index({ organization_id: 1, topic_id: 1 });
ConfusionLogSchema.index({ student_id: 1 });
ConfusionLogSchema.index({ topic_id: 1 });
ConfusionLogSchema.index({ session_id: 1 });

export default mongoose.models.ConfusionLog || mongoose.model('ConfusionLog', ConfusionLogSchema);
