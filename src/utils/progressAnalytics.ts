interface QuizAttemptLite {
  completed_at: string;
  is_correct: boolean;
  skill_area: string;
  topic?: string | null;
}

interface WeakTopicLite {
  topic: string;
  skill_area: string;
  mistakes_count: number;
}

export interface ReadinessPoint {
  day: string;
  actual: number;
  target: number;
}

export function buildReadinessTrend(
  quizHistory: QuizAttemptLite[],
  readinessScore: number,
  examDate?: string | null,
  days = 14
): ReadinessPoint[] {
  const timeline: Date[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    timeline.push(d);
  }

  const byDay = new Map<string, { total: number; correct: number }>();
  for (const attempt of quizHistory) {
    const date = new Date(attempt.completed_at);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    const row = byDay.get(key) ?? { total: 0, correct: 0 };
    row.total += 1;
    if (attempt.is_correct) row.correct += 1;
    byDay.set(key, row);
  }

  const examDaysLeft = examDate
    ? Math.max(1, Math.ceil((new Date(examDate).getTime() - today.getTime()) / 86_400_000))
    : 30;
  const targetEnd = Math.min(100, Math.max(70, Math.round((readinessScore + (100 - readinessScore) * (days / examDaysLeft)) * 10) / 10));

  let cumulativeCorrect = 0;
  let cumulativeTotal = 0;
  const startActual = Math.max(0, readinessScore - 12);

  return timeline.map((date, idx) => {
    const key = date.toISOString().slice(0, 10);
    const row = byDay.get(key);
    if (row) {
      cumulativeCorrect += row.correct;
      cumulativeTotal += row.total;
    }

    const dailyActual = cumulativeTotal > 0
      ? Math.round((cumulativeCorrect / cumulativeTotal) * 100)
      : startActual;
    const target = Math.round(startActual + ((targetEnd - startActual) * (idx + 1)) / days);

    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      actual: Math.max(0, Math.min(100, dailyActual)),
      target: Math.max(0, Math.min(100, target)),
    };
  });
}

export function buildRecommendations(
  weakTopics: WeakTopicLite[],
  quizHistory: QuizAttemptLite[]
) {
  const recommendations: string[] = [];
  const skillStats = new Map<string, { total: number; correct: number }>();

  for (const row of quizHistory) {
    const curr = skillStats.get(row.skill_area) ?? { total: 0, correct: 0 };
    curr.total += 1;
    if (row.is_correct) curr.correct += 1;
    skillStats.set(row.skill_area, curr);
  }

  for (const [skill, stat] of skillStats.entries()) {
    if (stat.total < 3) continue;
    const score = Math.round((stat.correct / stat.total) * 100);
    if (score < 65) {
      recommendations.push(`${skill} drills (${score}% accuracy)`);
    }
  }

  weakTopics
    .slice()
    .sort((a, b) => b.mistakes_count - a.mistakes_count)
    .slice(0, 3)
    .forEach((wt) => recommendations.push(`${wt.topic} (${wt.skill_area})`));

  return Array.from(new Set(recommendations)).slice(0, 4);
}
