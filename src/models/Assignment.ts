import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignment_type: { type: String, enum: ['homework', 'project', 'quiz', 'essay', 'other'], default: 'homework' },
    description: { type: String, default: '' },
    rubric: { type: mongoose.Schema.Types.Mixed },
    embedding_vector: { type: [Number] },
    due_days: { type: Number, default: 7 },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AssignmentSchema.index({ organization_id: 1, topic_id: 1 });
AssignmentSchema.index({ topic_id: 1 });
AssignmentSchema.index({ teacher_id: 1 });

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
