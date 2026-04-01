import mongoose from 'mongoose';

const StudentProfileSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grade: { type: String },
    board: { type: String },
    learning_preferences: { type: mongoose.Schema.Types.Mixed },
    /** @legacy MARKETPLACE_LMS — ids of `Lesson` (course player). Prefer Session + MasteryRecord for AI path. */
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
);

StudentProfileSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);
