/** Deterministic mastery model shared by the study room and the progress page. */
export type MasteryInput = {
  diagnostic: number;
  recall: number;
  practice: number;
};

export const MASTERY_WEIGHTS = { diagnostic: 0.2, recall: 0.3, practice: 0.5 };

export function computeMastery({ diagnostic, recall, practice }: MasteryInput): number {
  const value =
    diagnostic * MASTERY_WEIGHTS.diagnostic +
    recall * MASTERY_WEIGHTS.recall +
    practice * MASTERY_WEIGHTS.practice;
  return Math.round(Math.max(0, Math.min(100, value)));
}

export function masteryBand(mastery: number): {
  label: string;
  level: "beginner" | "intermediate" | "advanced";
} {
  if (mastery >= 80) return { label: "Mastered", level: "advanced" };
  if (mastery >= 60) return { label: "Exam ready", level: "advanced" };
  if (mastery >= 40) return { label: "Developing", level: "intermediate" };
  if (mastery > 0) return { label: "Fragile", level: "beginner" };
  return { label: "Not started", level: "beginner" };
}

export const STAGES = [
  { key: "diagnose", label: "Diagnose" },
  { key: "teach", label: "Teach" },
  { key: "recall", label: "Active recall" },
  { key: "pyq", label: "PYQ" },
  { key: "practice", label: "Practice" },
  { key: "analysis", label: "Analyse mistakes" },
  { key: "revision", label: "Revise" },
  { key: "mastery", label: "Mastery" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
