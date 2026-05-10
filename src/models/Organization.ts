import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    /** Unique per school; optional so individual/default orgs can omit it. */
    invite_code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
      maxlength: 64,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
