import mongoose from 'mongoose';

const RecommendationFeedbackSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recommendation_id: { type: String, required: true },
    feedback_type: { type: String },
    feedback_reason: { type: String },
  },
  { timestamps: true, collection: 'recommendation_feedback' }
);

RecommendationFeedbackSchema.index({ organization_id: 1, student_id: 1 });
RecommendationFeedbackSchema.index({ student_id: 1 });

export default mongoose.models.RecommendationFeedback || mongoose.model('RecommendationFeedback', RecommendationFeedbackSchema);
