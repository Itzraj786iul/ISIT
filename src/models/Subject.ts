/**
 * AI-first curriculum spine — parent of `Topic`. Canonical entry for org-scoped learning.
 * See docs/AI_FIRST_MIGRATION.md
 */
import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    name: { type: String, required: true },
    grade: { type: String, required: true },
    board: { type: String, required: true },
    description: { type: String, default: '' },
    academic_year: { type: String, required: true },
    curriculum_version: { type: String, default: '1.0' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ organization_id: 1, grade: 1 });
SubjectSchema.index({ organization_id: 1, name: 1 });
SubjectSchema.index({ class_id: 1, name: 1 });

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
