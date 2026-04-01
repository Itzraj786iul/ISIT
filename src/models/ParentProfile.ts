import mongoose from 'mongoose';

const ParentProfileSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    children: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        added_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ParentProfileSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.models.ParentProfile || mongoose.model('ParentProfile', ParentProfileSchema);
