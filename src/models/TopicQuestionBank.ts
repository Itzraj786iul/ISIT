import mongoose from 'mongoose';

const TopicQuestionBankSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    difficulty_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    question_text: { type: String, required: true },
    options: { type: [String], default: [] },
    correct_answer: { type: String, required: true },
    explanation: { type: String, default: '' },
    embedding_vector: { type: [Number] },
    approved: { type: Boolean, default: false },
    usage_count: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'topic_question_bank' }
);

TopicQuestionBankSchema.index({ organization_id: 1, topic_id: 1 });
TopicQuestionBankSchema.index({ topic_id: 1 });

export default mongoose.models.TopicQuestionBank || mongoose.model('TopicQuestionBank', TopicQuestionBankSchema);
