import mongoose from 'mongoose';

/**
 * Edge: from_topic_id is a prerequisite for to_topic_id.
 * "to_topic_id requires from_topic_id to be completed first."
 */
const PrerequisiteGraphSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    from_topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    to_topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  },
  { timestamps: true, collection: 'prerequisite_graph' }
);

PrerequisiteGraphSchema.index({ organization_id: 1, from_topic_id: 1 });
PrerequisiteGraphSchema.index({ organization_id: 1, to_topic_id: 1 });

export default mongoose.models.PrerequisiteGraph || mongoose.model('PrerequisiteGraph', PrerequisiteGraphSchema);
