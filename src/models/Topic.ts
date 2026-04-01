import mongoose from 'mongoose';

/**
 * Produces a URL-safe slug: lowercase, spaces to hyphens, strip non-alphanumeric except hyphen.
 */
function toUrlSafeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'topic';
}

const TopicSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic_name: { type: String, required: true },
    topic_slug: { type: String, required: true },
    topic_description: { type: String, default: '' },
    learning_objectives: { type: [String], default: [] },
    learning_outcomes: { type: [String], default: [] },
    key_concepts: { type: [String], default: [] },
    difficulty_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    topic_order: { type: Number, required: true, default: 0 },
    estimated_time: { type: Number, default: 0 }, // minutes
    academic_year: { type: String, required: true },
    curriculum_version: { type: String, default: '1.0' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TopicSchema.index({ organization_id: 1, subject_id: 1 });
TopicSchema.index({ organization_id: 1, subject_id: 1, topic_order: 1 });
TopicSchema.index({ organization_id: 1, topic_slug: 1 });

TopicSchema.pre('validate', function (next) {
  const raw = this.topic_slug || this.topic_name;
  if (raw) {
    this.topic_slug = toUrlSafeSlug(String(raw));
  }
  next();
});

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
