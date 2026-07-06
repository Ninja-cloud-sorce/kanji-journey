'use strict';

// SM-2 spaced-repetition algorithm.
// grade: 0–2 = forgot, 3–5 = recalled (5 = perfect)
function sm2Review(card, grade) {
  let { ease_factor, interval_days, reviews_total, reviews_correct } = card;

  reviews_total = (reviews_total ?? 0) + 1;
  if (grade >= 3) reviews_correct = (reviews_correct ?? 0) + 1;

  let review_state;

  if (grade < 3) {
    interval_days = 1;
    ease_factor = Math.max(1.3, (ease_factor ?? 2.5) - 0.2);
    review_state = 'learning';
  } else {
    const ef = ease_factor ?? 2.5;
    if (!interval_days || interval_days <= 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ef);
    }
    ease_factor = Math.max(1.3, ef + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    review_state = interval_days >= 21 ? 'review' : 'learning';
  }

  const next = new Date();
  next.setDate(next.getDate() + interval_days);
  const next_review_date = next.toISOString().slice(0, 10);

  return { ease_factor, interval_days, review_state, next_review_date, reviews_total, reviews_correct, updated_at: new Date().toISOString() };
}

module.exports = { sm2Review };
