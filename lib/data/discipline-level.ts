/** GitHub-style discipline intensity level (0 = none, 4 = strongest). */
export type DisciplineLevel = 0 | 1 | 2 | 3 | 4;

export function getDisciplineLevel(rate: number): DisciplineLevel {
  if (rate <= 0) return 0;
  if (rate <= 30) return 1;
  if (rate <= 60) return 2;
  if (rate <= 90) return 3;
  return 4;
}

export const DISCIPLINE_LEVEL_LABELS = [
  "0%",
  "1–30%",
  "31–60%",
  "61–90%",
  "90–100%",
] as const;
