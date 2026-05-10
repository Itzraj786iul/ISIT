import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  },
  { timestamps: true, collection: 'classes' }
);

ClassSchema.index({ organization_id: 1, name: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
