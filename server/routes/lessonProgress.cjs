'use strict';
const express = require('express');
const LessonProgress = require('../models/LessonProgress.cjs');
const { authSupabase } = require('../middleware/authSupabase.cjs');

const router = express.Router();

// GET /api/lesson-progress/:userId?level= — all progress rows for a user
router.get('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const filter = { user_id: userId };
    if (req.query.level) filter.level = req.query.level;

    const rows = await LessonProgress.find(filter).lean();
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/lesson-progress — upsert a single lesson progress row
router.post('/', authSupabase(), async (req, res) => {
  try {
    const {
      user_id, lesson_id, level, week_number,
      completed, completed_at, quiz_score, time_spent_sec,
    } = req.body;

    if (req.userId !== user_id) return res.status(403).json({ error: 'Forbidden' });
    if (!user_id || !lesson_id) return res.status(400).json({ error: 'user_id and lesson_id are required' });

    const row = await LessonProgress.findOneAndUpdate(
      { user_id, lesson_id },
      {
        $set: {
          level:          level ?? 'N5',
          week_number:    week_number ?? 1,
          completed:      completed ?? false,
          completed_at:   completed_at ?? null,
          quiz_score:     quiz_score ?? null,
          time_spent_sec: time_spent_sec ?? 0,
        },
        $setOnInsert: {
          id:         crypto.randomUUID(),
          created_at: new Date().toISOString(),
        },
      },
      { new: true, upsert: true, lean: true }
    );

    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
