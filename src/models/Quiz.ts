/**
 * @legacy MARKETPLACE_LMS — Quiz tied to marketplace `Lesson`. Prefer `TopicQuestionBank` + topic-based UX.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  questions: { type: [QuestionSchema], required: true },
}, { timestamps: true });

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
