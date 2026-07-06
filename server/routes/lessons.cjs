'use strict';
const express = require('express');
const { authSupabase } = require('../middleware/authSupabase.cjs');
const { getLessonsByCollection, getLessonsByLevel, getLessonById } = require('../data/lessonCatalog.cjs');
const LessonProgress = require('../models/LessonProgress.cjs');

const router = express.Router();

// GET /api/lessons?collectionId=&userId= — lessons with completion status
router.get('/', authSupabase(), async (req, res) => {
  try {
    const { collectionId, userId: queryUserId } = req.query;
    const userId = queryUserId || req.userId;

    if (!collectionId) return res.status(400).json({ error: 'collectionId is required' });

    const lessons = getLessonsByCollection(collectionId);

    let completedIds = new Set();
    if (userId) {
      const rows = await LessonProgress.find({ user_id: userId, completed: true }).select('lesson_id').lean();
      completedIds = new Set(rows.map((r) => r.lesson_id));
    }

    const result = lessons.map((lesson) => ({
      ...lesson,
      status: completedIds.has(lesson.id) ? 'COMPLETED' : 'CURRENT',
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/lessons/catalog?level= — lesson catalog rows for a level (for Roadmap / nextLesson)
router.get('/catalog', authSupabase(), (req, res) => {
  const level = req.query.level;
  if (!level) return res.status(400).json({ error: 'level is required' });
  return res.json(getLessonsByLevel(level));
});

// GET /api/lessons/:lessonId — single lesson metadata
router.get('/:lessonId', authSupabase(), (req, res) => {
  const lesson = getLessonById(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  return res.json(lesson);
});

module.exports = router;
