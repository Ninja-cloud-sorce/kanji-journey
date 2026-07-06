'use strict';
const express = require('express');
const LessonProgress = require('../models/LessonProgress.cjs');
const { authSupabase } = require('../middleware/authSupabase.cjs');
const { getLessonById } = require('../data/lessonCatalog.cjs');

const router = express.Router();

// GET /api/quiz-history/:userId?limit=20
// Returns recent completed lesson records enriched with lesson title + skill_area.
router.get('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const rows = await LessonProgress.find({ user_id: userId, completed: true })
      .sort({ completed_at: -1 })
      .limit(limit)
      .lean();

    const result = rows.map((row) => {
      const catalogRow = getLessonById(row.lesson_id);
      return {
        id:           row.id,
        created_at:   row.completed_at ?? row.created_at,
        type:         catalogRow?.skill_area ?? 'lesson',
        score:        row.quiz_score ?? 0,
        duration_sec: row.time_spent_sec ?? 0,
        lesson_id:    row.lesson_id,
        lessons:      catalogRow ? { title: catalogRow.title } : null,
      };
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
