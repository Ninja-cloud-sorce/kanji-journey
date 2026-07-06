'use strict';
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    // Matches the Supabase profiles row shape exactly so the frontend TypeScript types still work.
    id:                   { type: String, default: () => crypto.randomUUID() },
    user_id:              { type: String, required: true, unique: true, index: true },
    display_name:         { type: String,  default: null },
    bio:                  { type: String,  default: null },
    avatar_url:           { type: String,  default: null },
    current_level:        { type: String,  default: 'N5' },
    xp:                   { type: Number,  default: 0 },
    streak:               { type: Number,  default: 0 },
    readiness_score:      { type: Number,  default: 0 },
    daily_goal_minutes:   { type: Number,  default: 20 },
    exam_date:            { type: String,  default: null },
    learning_path:        { type: String,  default: null },
    onboarding_completed: { type: Boolean, default: false },
    last_activity_date:   { type: String,  default: null },
    created_at:           { type: String,  default: () => new Date().toISOString() },
    updated_at:           { type: String,  default: () => new Date().toISOString() },
  },
  { collection: 'profiles', versionKey: false }
);

profileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret.id || ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
