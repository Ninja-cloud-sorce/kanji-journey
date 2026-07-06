'use strict';
const express = require('express');
const LearningPath = require('../models/LearningPath.cjs');
const { authSupabase } = require('../middleware/authSupabase.cjs');

const router = express.Router();

// GET /api/learning-paths/:userId
router.get('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const doc = await LearningPath.findOne({ user_id: userId }).lean();
    return res.json(doc ?? null);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/learning-paths/:userId — upsert
router.put('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { selected_level, motivation, hours_per_week, prior_experience } = req.body;

    const doc = await LearningPath.findOneAndUpdate(
      { user_id: userId },
      {
        $set: {
          selected_level:   selected_level ?? 'N5',
          motivation:       motivation ?? null,
          hours_per_week:   hours_per_week ?? null,
          prior_experience: prior_experience ?? null,
          updated_at:       new Date().toISOString(),
        },
        $setOnInsert: {
          id:         crypto.randomUUID(),
          created_at: new Date().toISOString(),
        },
      },
      { new: true, upsert: true, lean: true }
    );

    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
