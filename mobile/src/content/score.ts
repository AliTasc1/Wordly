import type { CefrLevel } from '../data/curriculum';
import type { TestResult } from '../state/AppContext';
import { LEVELS, type PlacementQuestion } from './index';

/** A level counts as reached when at least this share of its questions is right. */
export const PASS_RATIO = 0.5;

const empty = () =>
  Object.fromEntries(LEVELS.map((l) => [l, { right: 0, asked: 0 }])) as TestResult['byLevel'];

/**
 * Turns the placement answers into a level.
 *
 * The rule is deliberately strict about order: a learner is placed at the
 * highest level they passed *without a gap below it*. Someone who guesses two
 * C2 questions correctly but misses half of B1 is a B1 learner who got lucky,
 * and starting them at C2 would waste their time and their subscription.
 *
 * `picks[i]` is the option index chosen for `questions[i]`, or null if skipped.
 */
export function scorePlacement(
  questions: PlacementQuestion[],
  picks: (number | null)[],
): TestResult {
  const byLevel = empty();
  let right = 0;

  questions.forEach((question, i) => {
    const bucket = byLevel[question.level];
    bucket.asked += 1;
    if (picks[i] === question.answer) {
      bucket.right += 1;
      right += 1;
    }
  });

  // A1 is the floor: a learner who fails it still has to start somewhere.
  let level: CefrLevel = 'A1';
  for (const candidate of LEVELS) {
    const bucket = byLevel[candidate];
    if (bucket.asked === 0) continue;
    if (bucket.right / bucket.asked < PASS_RATIO) break;
    level = candidate;
  }

  return { level, byLevel, right, asked: questions.length };
}
