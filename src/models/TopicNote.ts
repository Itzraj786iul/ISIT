import mongoose from 'mongoose';

const TopicNoteSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    grade: { type: String },
    board: { type: String },
    note_type: { type: String, enum: ['summary', 'key_points', 'detailed', 'revision'], default: 'summary' },
    content_markdown: { type: String, required: true },
    embedding_vector: { type: [Number] },
    content_version: { type: String, default: '1.0' },
    approved: { type: Boolean, default: false },
    usage_count: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'topic_notes' }
);

TopicNoteSchema.index({ organization_id: 1, topic_id: 1 });
TopicNoteSchema.index({ topic_id: 1 });

export default mongoose.models.TopicNote || mongoose.model('TopicNote', TopicNoteSchema);
