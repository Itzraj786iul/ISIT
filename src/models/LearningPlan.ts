import mongoose from 'mongoose';

const LearningPlanSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week_start_date: { type: Date, required: true },
    weekly_roadmap: { type: mongoose.Schema.Types.Mixed },
    daily_plan: { type: mongoose.Schema.Types.Mixed },
    revision_schedule: { type: mongoose.Schema.Types.Mixed },
    generated_by: { type: String },
    plan_version: { type: String, default: '1.0' },
  },
  { timestamps: true, collection: 'learning_plans' }
);

LearningPlanSchema.index({ organization_id: 1, student_id: 1 });
LearningPlanSchema.index({ organization_id: 1, week_start_date: 1 });
LearningPlanSchema.index({ student_id: 1 });

export default mongoose.models.LearningPlan || mongoose.model('LearningPlan', LearningPlanSchema);
