import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Teacher', 'Parent'], default: 'Student' },
    status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
    email_verified: { type: Boolean, default: false },
    name: { type: String, default: '' }, // display name for frontend compatibility
    last_login: { type: Date },
  },
  { timestamps: true, collection: 'users' }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
