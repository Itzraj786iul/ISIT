import mongoose from 'mongoose';

const AssignedTopicSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /** When set, all students with `User.class_id` matching this class receive the assignment. */
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
    /** When set, only this student receives the assignment. Exactly one of class_id or student_id must be set. */
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    due_date: { type: Date, default: null },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed'],
      default: 'assigned',
    },
    /**
     * Per-student lifecycle (sessions, mastery) is stored in `AssignedTopicProgress`.
     * These optional fields are reserved for future teacher/system use (e.g. class-wide unlock dates).
     */
    started_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'assigned_topics' }
);

AssignedTopicSchema.index({ organization_id: 1, topic_id: 1, student_id: 1 });
AssignedTopicSchema.index({ organization_id: 1, topic_id: 1, class_id: 1 });
AssignedTopicSchema.index({ organization_id: 1, student_id: 1 });
AssignedTopicSchema.index({ organization_id: 1, class_id: 1 });

AssignedTopicSchema.pre('validate', function assignTopicXor(next) {
  const hasClass = this.class_id != null;
  const hasStudent = this.student_id != null;
  if (hasClass === hasStudent) {
    next(new Error('Exactly one of class_id or student_id must be set'));
  } else {
    next();
  }
});

export default mongoose.models.AssignedTopic || mongoose.model('AssignedTopic', AssignedTopicSchema);
