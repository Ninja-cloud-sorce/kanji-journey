'use strict';
const express = require('express');
const LevelOverride = require('../models/LevelOverride.cjs');
const Profile = require('../models/Profile.cjs');
const { authSupabase } = require('../middleware/authSupabase.cjs');

const router = express.Router();

// GET /api/level-overrides/:userId
router.get('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const doc = await LevelOverride.findOne({ user_id: userId }).lean();
    return res.json(doc ?? null);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/level-overrides/:userId — upsert override + sync profile.current_level
router.put('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { level } = req.body;
    if (!level) return res.status(400).json({ error: 'level is required' });

    const [doc] = await Promise.all([
      LevelOverride.findOneAndUpdate(
        { user_id: userId },
        {
          $set:         { level, confirmed_at: new Date().toISOString() },
          $setOnInsert: { id: crypto.randomUUID() },
        },
        { new: true, upsert: true, lean: true }
      ),
      Profile.findOneAndUpdate(
        { user_id: userId },
        { $set: { current_level: level, updated_at: new Date().toISOString() } }
      ),
    ]);

    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
