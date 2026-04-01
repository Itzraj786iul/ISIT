import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    video_url: { type: String, required: true },
    thumbnail_url: { type: String },
    duration_seconds: { type: Number, default: 0 },
    grade: { type: String },
    board: { type: String },
    status: { type: String, enum: ['draft', 'processing', 'ready', 'archived'], default: 'draft' },
    uploaded_by_teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    embedding_vector: { type: [Number] },
  },
  { timestamps: true }
);

VideoSchema.index({ organization_id: 1, topic_id: 1 });
VideoSchema.index({ topic_id: 1 });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
