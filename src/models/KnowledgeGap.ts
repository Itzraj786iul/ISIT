import mongoose from 'mongoose';

const KnowledgeGapSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    root_cause_topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    severity_score: { type: Number, default: 0 },
    detected_reason: { type: String },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'knowledge_gaps' }
);

KnowledgeGapSchema.index({ organization_id: 1, student_id: 1 });
KnowledgeGapSchema.index({ organization_id: 1, topic_id: 1 });
KnowledgeGapSchema.index({ student_id: 1 });
KnowledgeGapSchema.index({ topic_id: 1 });

export default mongoose.models.KnowledgeGap || mongoose.model('KnowledgeGap', KnowledgeGapSchema);
