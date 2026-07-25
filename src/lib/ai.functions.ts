import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DiagnosisResult = {
  level: "beginner" | "intermediate" | "advanced";
  score: number;
  verdict: string;
  misconceptions: string[];
  known: string[];
  focus: string;
};

export type TeachResult = {
  title: string;
  lesson: string;
  key_points: string[];
  memory_hook: string;
};

export type RecallResult = {
  score: number;
  verdict: string;
  feedback: string;
  gaps: string[];
};

export type MistakeAnalysis = {
  summary: string;
  mistakes: Array<{ concept_tag: string; mistake_type: string; description: string }>;
  revision: Array<{ title: string; description: string; priority: string }>;
};

/** Stage 1 — analyse the student's prior knowledge from a diagnostic answer. */
export const aiDiagnose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { topicName: string; question: string; expected: string; answer: string }) => input,
  )
  .handler(async ({ data }) => {
    const { diagnose } = await import("./mentor.server");
    return diagnose(data);
  });

/** Stage 2 — teach the concept at the diagnosed level, correcting misconceptions. */
export const aiTeach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      topicName: string;
      level: string;
      sourceTitle: string;
      sourceContent: string;
      misconceptions: string[];
      focus: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { teach } = await import("./mentor.server");
    return teach(data);
  });

/** Stage 3 — evaluate an active-recall answer. */
export const aiEvaluateRecall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { topicName: string; question: string; expected: string; answer: string }) => input,
  )
  .handler(async ({ data }) => {
    const { evaluateRecall } = await import("./mentor.server");
    return evaluateRecall(data);
  });

/** Stage 5 — analyse mistakes across the session and design revision work. */
export const aiAnalyseMistakes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      topicName: string;
      items: Array<{
        question: string;
        concept_tag: string;
        chosen: string;
        correct: string;
        stage: string;
      }>;
      recallGaps: string[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const { analyseMistakes } = await import("./mentor.server");
    return analyseMistakes(data);
  });

/** Free-form mentor conversation, grounded in the student's own performance. */
export const aiMentorChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      profileSummary: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { mentorChat } = await import("./mentor.server");
    return mentorChat(data);
  });
