'use strict';
const express = require('express');
const { authSupabase } = require('../middleware/authSupabase.cjs');
const { COLLECTIONS, getLessonsByCollection } = require('../data/lessonCatalog.cjs');
const LessonProgress = require('../models/LessonProgress.cjs');

const router = express.Router();

// GET /api/collections?userId= — all collections with per-collection progress
router.get('/', authSupabase(), async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;

    let completedIds = new Set();
    if (userId) {
      const rows = await LessonProgress.find({ user_id: userId, completed: true }).select('lesson_id').lean();
      completedIds = new Set(rows.map((r) => r.lesson_id));
    }

    const result = COLLECTIONS.map((col) => {
      const lessons = getLessonsByCollection(col.id);
      const total = lessons.length;
      const completed = lessons.filter((l) => completedIds.has(l.id)).length;
      return {
        ...col,
        progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:id — single collection metadata
router.get('/:id', authSupabase(), (req, res) => {
  const col = COLLECTIONS.find((c) => c.id === req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  return res.json(col);
});

module.exports = router;
