import mongoose from 'mongoose';

/**
 * Per-student state for an `AssignedTopic` (direct or class-scoped).
 * Class assignments share one AssignedTopic row; each student’s status lives here.
 */
const AssignedTopicProgressSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    assigned_topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AssignedTopic', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed'],
      default: 'assigned',
    },
    started_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'assigned_topic_progress' }
);

AssignedTopicProgressSchema.index({ assigned_topic_id: 1, student_id: 1 }, { unique: true });
AssignedTopicProgressSchema.index({ organization_id: 1, student_id: 1 });

export default mongoose.models.AssignedTopicProgress ||
  mongoose.model('AssignedTopicProgress', AssignedTopicProgressSchema);
