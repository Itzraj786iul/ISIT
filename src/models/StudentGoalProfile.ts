import mongoose from 'mongoose';

const StudentGoalProfileSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal_type: { type: String },
    target_exam_date: { type: Date },
    target_mastery_score: { type: Number },
    preferred_study_minutes_per_day: { type: Number },
  },
  { timestamps: true, collection: 'student_goal_profiles' }
);

StudentGoalProfileSchema.index({ organization_id: 1, student_id: 1 });
StudentGoalProfileSchema.index({ student_id: 1 });

export default mongoose.models.StudentGoalProfile || mongoose.model('StudentGoalProfile', StudentGoalProfileSchema);
