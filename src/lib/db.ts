import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const FOCUS_TOPIC_SLUG = "fundamental-rights";

export type Topic = Tables<"topics">;
export type Subject = Tables<"subjects">;
export type KnowledgeUnit = Tables<"knowledge_units">;
export type Question = Tables<"questions">;
export type Pyq = Tables<"pyqs">;
export type Note = Tables<"notes">;
export type StudySession = Tables<"study_sessions">;
export type Attempt = Tables<"attempts">;
export type Mistake = Tables<"mistakes">;
export type RevisionTask = Tables<"revision_tasks">;
export type MasteryScore = Tables<"mastery_scores">;
export type Profile = Tables<"profiles">;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const optionsOf = (value: unknown): string[] =>
  Array.isArray(value) ? (value as string[]).map(String) : [];

export const pointsOf = (value: unknown): string[] =>
  Array.isArray(value) ? (value as string[]).map(String) : [];

/* ---------------- content (publicly readable) ---------------- */

export const subjectsQuery = () =>
  queryOptions({
    queryKey: ["subjects"],
    queryFn: async () =>
      unwrap(await supabase.from("subjects").select("*").order("sort_order")) as Subject[],
  });

export const topicsQuery = () =>
  queryOptions({
    queryKey: ["topics"],
    queryFn: async () =>
      unwrap(await supabase.from("topics").select("*").order("sort_order")) as Topic[],
  });

export const focusTopicQuery = () =>
  queryOptions({
    queryKey: ["topic", FOCUS_TOPIC_SLUG],
    queryFn: async () =>
      unwrap(
        await supabase.from("topics").select("*").eq("slug", FOCUS_TOPIC_SLUG).single(),
      ) as Topic,
  });

export const knowledgeUnitsQuery = (topicId?: string) =>
  queryOptions({
    queryKey: ["knowledge_units", topicId],
    enabled: Boolean(topicId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("knowledge_units")
          .select("*")
          .eq("topic_id", topicId!)
          .order("sort_order"),
      ) as KnowledgeUnit[],
  });

export const questionsQuery = (topicId?: string, kind?: string) =>
  queryOptions({
    queryKey: ["questions", topicId, kind],
    enabled: Boolean(topicId),
    queryFn: async () => {
      let q = supabase.from("questions").select("*").eq("topic_id", topicId!);
      if (kind) q = q.eq("kind", kind);
      return unwrap(await q.order("sort_order")) as Question[];
    },
  });

export const pyqsQuery = (topicId?: string) =>
  queryOptions({
    queryKey: ["pyqs", topicId],
    enabled: Boolean(topicId),
    queryFn: async () =>
      unwrap(
        await supabase.from("pyqs").select("*").eq("topic_id", topicId!).order("year", {
          ascending: false,
        }),
      ) as Pyq[],
  });

/* ---------------- learner data (RLS scoped) ---------------- */

export const profileQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
      ) as Profile | null,
  });

export const notesQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["notes", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase.from("notes").select("*").order("updated_at", { ascending: false }),
      ) as Note[],
  });

export const sessionsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["study_sessions", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("study_sessions")
          .select("*")
          .order("started_at", { ascending: false }),
      ) as StudySession[],
  });

export const sessionQuery = (sessionId?: string) =>
  queryOptions({
    queryKey: ["study_session", sessionId],
    enabled: Boolean(sessionId),
    queryFn: async () =>
      unwrap(
        await supabase.from("study_sessions").select("*").eq("id", sessionId!).maybeSingle(),
      ) as StudySession | null,
  });

export const attemptsQuery = (userId?: string, sessionId?: string) =>
  queryOptions({
    queryKey: ["attempts", userId, sessionId ?? "all"],
    enabled: Boolean(userId),
    queryFn: async () => {
      let q = supabase.from("attempts").select("*");
      if (sessionId) q = q.eq("session_id", sessionId);
      return unwrap(await q.order("created_at", { ascending: true })) as Attempt[];
    },
  });

export const mistakesQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["mistakes", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase.from("mistakes").select("*").order("created_at", { ascending: false }),
      ) as Mistake[],
  });

export const revisionQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["revision_tasks", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase.from("revision_tasks").select("*").order("due_date", { ascending: true }),
      ) as RevisionTask[],
  });

export const masteryQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["mastery_scores", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(await supabase.from("mastery_scores").select("*")) as MasteryScore[],
  });
