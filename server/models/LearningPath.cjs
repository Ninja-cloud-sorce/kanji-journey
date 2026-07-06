'use strict';
const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema(
  {
    id:               { type: String, default: () => crypto.randomUUID() },
    user_id:          { type: String, required: true, unique: true, index: true },
    selected_level:   { type: String, default: 'N5' },
    motivation:       { type: String, default: null },
    hours_per_week:   { type: Number, default: null },
    prior_experience: { type: String, default: null },
    created_at:       { type: String, default: () => new Date().toISOString() },
    updated_at:       { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'learning_paths', versionKey: false }
);

learningPathSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret.id || ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.models.LearningPath || mongoose.model('LearningPath', learningPathSchema);
