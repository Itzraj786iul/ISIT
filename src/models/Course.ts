/**
 * @legacy MARKETPLACE_LMS — Paid/listed courses with `enrolledStudents`. Not the AI-first spine.
 * Target spine: Subject → Topic → Session. Migration: docs/AI_FIRST_MIGRATION.md
 */
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 3999 },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);