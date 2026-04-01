import mongoose from 'mongoose';

const VideoSubtitleSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    video_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    start_time: { type: Number, required: true },
    end_time: { type: Number, required: true },
    text: { type: String, required: true },
    chunk_index: { type: Number, required: true },
    embedding_vector: { type: [Number] },
  },
  { timestamps: true, collection: 'video_subtitles' }
);

VideoSubtitleSchema.index({ organization_id: 1, video_id: 1 });
VideoSubtitleSchema.index({ video_id: 1, chunk_index: 1 });

export default mongoose.models.VideoSubtitle || mongoose.model('VideoSubtitle', VideoSubtitleSchema);
