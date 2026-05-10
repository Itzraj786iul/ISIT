import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Teacher', 'Parent', 'Admin'], default: 'Student' },
    status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
    email_verified: { type: Boolean, default: false },
    name: { type: String, default: '' }, // display name for frontend compatibility
    last_login: { type: Date },
    /** Teacher (org-created): classes they teach */
    assigned_classes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
      default: [],
    },
    /** Teacher (org-created): subjects they teach */
    assigned_subjects: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
      default: [],
    },
    /** Student: org class roster — used for class-wide assigned topics */
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },

    password_reset_token: { type: String, default: null },
    password_reset_expires: { type: Date, default: null },
    email_verify_token: { type: String, default: null },
    email_verify_expires: { type: Date, default: null },
  },
  { timestamps: true, collection: 'users' }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
