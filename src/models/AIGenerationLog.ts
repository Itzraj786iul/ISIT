import mongoose from 'mongoose';

const AIGenerationLogSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    model_used: { type: String, required: true },
    task_type: { type: String },
    tokens_used: { type: Number },
    estimated_cost: { type: Number },
    response_time_ms: { type: Number },
  },
  { timestamps: true, collection: 'ai_generation_logs' }
);

AIGenerationLogSchema.index({ organization_id: 1, student_id: 1 });
AIGenerationLogSchema.index({ organization_id: 1, model_used: 1 });
AIGenerationLogSchema.index({ student_id: 1 });

export default mongoose.models.AIGenerationLog || mongoose.model('AIGenerationLog', AIGenerationLogSchema);
