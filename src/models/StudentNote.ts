import mongoose from 'mongoose';

const StudentNoteSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    base_note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TopicNote' },
    personalized_highlights: { type: mongoose.Schema.Types.Mixed },
    embedding_vector: { type: [Number] },
  },
  { timestamps: true, collection: 'student_notes' }
);

StudentNoteSchema.index({ organization_id: 1, student_id: 1 });
StudentNoteSchema.index({ organization_id: 1, topic_id: 1 });
StudentNoteSchema.index({ student_id: 1, topic_id: 1 });
StudentNoteSchema.index({ topic_id: 1 });

export default mongoose.models.StudentNote || mongoose.model('StudentNote', StudentNoteSchema);
