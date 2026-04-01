import mongoose from 'mongoose';

/**
 * Recommended progression: from_topic_id is followed by to_topic_id (optional order for multiple next topics).
 */
const TopicProgressionMapSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    from_topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    to_topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'topic_progression_map' }
);

TopicProgressionMapSchema.index({ organization_id: 1, subject_id: 1 });
TopicProgressionMapSchema.index({ organization_id: 1, from_topic_id: 1 });

export default mongoose.models.TopicProgressionMap || mongoose.model('TopicProgressionMap', TopicProgressionMapSchema);
