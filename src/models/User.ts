import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Teacher', 'Parent'], default: 'Student' },
  grade: { type: String }, 
  extra: { type: Object },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // <--- ADD THIS LINE
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);