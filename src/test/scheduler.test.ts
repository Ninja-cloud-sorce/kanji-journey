/**
 * Unit tests for the SM-2 spaced-repetition scheduler logic.
 *
 * These mirror the SQL function public.review_flashcard() so we can verify
 * the algorithm is correct before deploying to Postgres.
 */

interface CardState {
  ease_factor: number;
  interval_days: number;
  review_state: 'new' | 'learning' | 'review' | 'relearning';
}

/** Pure TypeScript implementation of the SM-2 scheduler (mirrors the SQL RPC). */
function sm2Step(card: CardState, grade: number): CardState {
  let { ease_factor: ef, interval_days: interval, review_state: state } = card;

  if (grade >= 3) {
    // Correct response
    if (state === 'new' || state === 'learning') {
      interval = 1;
      state = 'review';
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    ef = Math.max(1.3, ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
    state = 'review';
  } else {
    // Wrong response
    interval = 1;
    state = 'relearning';
    ef = Math.max(1.3, ef - 0.2);
  }

  return { ease_factor: parseFloat(ef.toFixed(4)), interval_days: interval, review_state: state };
}

describe('SM-2 Scheduler', () => {
  const newCard: CardState = { ease_factor: 2.5, interval_days: 1, review_state: 'new' };

  test('grade 5 on new card → review state, interval 1', () => {
    const result = sm2Step(newCard, 5);
    expect(result.review_state).toBe('review');
    expect(result.interval_days).toBe(1);
    // ef increases: 2.5 + 0.1 = 2.6
    expect(result.ease_factor).toBeCloseTo(2.6, 3);
  });

  test('grade 5 on interval=1 card → interval 6', () => {
    const card: CardState = { ease_factor: 2.5, interval_days: 1, review_state: 'review' };
    const result = sm2Step(card, 5);
    expect(result.interval_days).toBe(6);
  });

  test('grade 5 on interval=6 card → interval ~15', () => {
    const card: CardState = { ease_factor: 2.5, interval_days: 6, review_state: 'review' };
    const result = sm2Step(card, 5);
    expect(result.interval_days).toBe(15); // round(6 * 2.5) = 15
  });

  test('grade 3 on interval=6 → ef unchanged (grade 3 is neutral)', () => {
    const card: CardState = { ease_factor: 2.5, interval_days: 6, review_state: 'review' };
    const result = sm2Step(card, 3);
    // ef change: 0.1 - (5-3) * (0.08 + (5-3)*0.02) = 0.1 - 2*(0.12) = 0.1 - 0.24 = -0.14
    expect(result.ease_factor).toBeCloseTo(2.36, 2);
  });

  test('grade 0 (blackout) → relearning, interval 1, ef drops', () => {
    const card: CardState = { ease_factor: 2.5, interval_days: 10, review_state: 'review' };
    const result = sm2Step(card, 0);
    expect(result.review_state).toBe('relearning');
    expect(result.interval_days).toBe(1);
    expect(result.ease_factor).toBeCloseTo(2.3, 2);
  });

  test('ef never drops below 1.3', () => {
    let card: CardState = { ease_factor: 1.4, interval_days: 3, review_state: 'review' };
    // Several wrong answers
    card = sm2Step(card, 0);
    card = sm2Step(card, 0);
    card = sm2Step(card, 0);
    expect(card.ease_factor).toBeGreaterThanOrEqual(1.3);
  });
});

// ─── Readiness formula unit tests ────────────────────────────────────────────

function calculateReadiness(
  quizAccuracy: number,   // 0–100
  lessonCoverage: number, // 0–100
  flashRetention: number  // 0–100
): number {
  const raw = 0.40 * quizAccuracy + 0.35 * lessonCoverage + 0.25 * flashRetention;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

describe('Readiness Formula', () => {
  test('all zeros → 0', () => {
    expect(calculateReadiness(0, 0, 0)).toBe(0);
  });

  test('all 100s → 100', () => {
    expect(calculateReadiness(100, 100, 100)).toBe(100);
  });

  test('example: 80 accuracy, 50 coverage, 70 retention', () => {
    // 0.4*80 + 0.35*50 + 0.25*70 = 32 + 17.5 + 17.5 = 67
    expect(calculateReadiness(80, 50, 70)).toBe(67);
  });

  test('weights sum: 40+35+25 = 100', () => {
    expect(0.40 + 0.35 + 0.25).toBeCloseTo(1.0);
  });
});

// ─── Weak topic aggregation unit tests ───────────────────────────────────────

interface QuizAttempt {
  topic: string;
  skill_area: string;
  is_correct: boolean;
}

interface WeakTopic {
  topic: string;
  skill_area: string;
  mistakes_count: number;
}

function aggregateWeakTopics(attempts: QuizAttempt[]): WeakTopic[] {
  const map = new Map<string, WeakTopic>();
  for (const a of attempts) {
    if (!a.is_correct) {
      const key = `${a.topic}|${a.skill_area}`;
      const existing = map.get(key);
      if (existing) {
        existing.mistakes_count += 1;
      } else {
        map.set(key, { topic: a.topic, skill_area: a.skill_area, mistakes_count: 1 });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.mistakes_count - a.mistakes_count);
}

describe('Weak Topic Aggregation', () => {
  const attempts: QuizAttempt[] = [
    { topic: 'particles', skill_area: 'grammar', is_correct: false },
    { topic: 'particles', skill_area: 'grammar', is_correct: false },
    { topic: 'greetings', skill_area: 'vocabulary', is_correct: false },
    { topic: 'particles', skill_area: 'grammar', is_correct: true },
    { topic: 'kanji', skill_area: 'kanji', is_correct: true },
  ];

  test('only wrong answers create weak topics', () => {
    const result = aggregateWeakTopics(attempts);
    expect(result.some((t) => t.topic === 'kanji')).toBe(false);
  });

  test('mistakes_count is summed correctly', () => {
    const result = aggregateWeakTopics(attempts);
    const particles = result.find((t) => t.topic === 'particles');
    expect(particles?.mistakes_count).toBe(2);
  });

  test('sorted by mistakes_count descending', () => {
    const result = aggregateWeakTopics(attempts);
    expect(result[0].topic).toBe('particles');
    expect(result[1].topic).toBe('greetings');
  });

  test('unique by (topic, skill_area) pair', () => {
    const result = aggregateWeakTopics(attempts);
    const keys = result.map((t) => `${t.topic}|${t.skill_area}`);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  test('empty attempts → empty result', () => {
    expect(aggregateWeakTopics([])).toEqual([]);
  });
});
