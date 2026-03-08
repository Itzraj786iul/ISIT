import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, required: true },
  videoUrl: { type: String }, 
}, { timestamps: true });

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);