import mongoose from 'mongoose';

const PerformanceMetricsSchema = new mongoose.Schema(
  {
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    avg_mastery: { type: Number, default: 0 },
    learning_time_minutes: { type: Number, default: 0 },
    retention_score: { type: Number },
    improvement_rate: { type: Number },
    topics_completed: { type: Number, default: 0 },
    confusion_frequency: { type: Number, default: 0 },
    updated_at: { type: Date, default: () => new Date() },
  },
  { timestamps: true, collection: 'performance_metrics' }
);

PerformanceMetricsSchema.index({ organization_id: 1, student_id: 1 });
PerformanceMetricsSchema.index({ organization_id: 1, month: 1 });
PerformanceMetricsSchema.index({ student_id: 1 });
PerformanceMetricsSchema.index({ student_id: 1, month: 1 });

export default mongoose.models.PerformanceMetrics || mongoose.model('PerformanceMetrics', PerformanceMetricsSchema);
