'use strict';
const express = require('express');
const WeakTopic = require('../models/WeakTopic.cjs');
const { authSupabase } = require('../middleware/authSupabase.cjs');

const router = express.Router();

// GET /api/weak-topics/:userId
router.get('/:userId', authSupabase(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const docs = await WeakTopic.find({ user_id: userId })
      .sort({ mistakes_count: -1 })
      .limit(20)
      .lean();

    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/weak-topics/batch — batch upsert (increment mistakes_count)
router.post('/batch', authSupabase(), async (req, res) => {
  try {
    const { items } = req.body; // [{ user_id, topic, skill_area, mistakes_count?, last_seen_at? }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    // Verify all items belong to the authenticated user
    const unauthorised = items.find((i) => i.user_id !== req.userId);
    if (unauthorised) return res.status(403).json({ error: 'Forbidden' });

    const now = new Date().toISOString();

    const ops = items.map((item) => ({
      updateOne: {
        filter: { user_id: item.user_id, topic: item.topic, skill_area: item.skill_area },
        update: {
          $inc:         { mistakes_count: item.mistakes_count ?? 1 },
          $set:         { last_seen_at: item.last_seen_at ?? now },
          $setOnInsert: { id: crypto.randomUUID() },
        },
        upsert: true,
      },
    }));

    await WeakTopic.bulkWrite(ops);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
