import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  NotebookPen,
  RotateCcw,
  ScanSearch,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { MiniMarkdown } from "@/components/mini-markdown";
import { QuestionCard } from "@/components/question-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import {
  aiAnalyseMistakes,
  aiDiagnose,
  aiEvaluateRecall,
  aiTeach,
  type DiagnosisResult,
  type MistakeAnalysis,
  type RecallResult,
  type TeachResult,
} from "@/lib/ai.functions";
import {
  focusTopicQuery,
  knowledgeUnitsQuery,
  optionsOf,
  pyqsQuery,
  questionsQuery,
  type Question,
} from "@/lib/db";
import { computeMastery, masteryBand, STAGES, type StageKey } from "@/lib/mastery";

export const Route = createFileRoute("/_authenticated/study-room")({
  head: () => ({
    meta: [
      { title: "AI Study Room — UPSC AI Mentor" },
      {
        name: "description",
        content:
          "Run the full adaptive cycle on Fundamental Rights: diagnostic, adaptive teaching, active recall, PYQ, practice, mistake analysis and mastery.",
      },
      { property: "og:title", content: "AI Study Room — UPSC AI Mentor" },
      {
        property: "og:description",
        content: "Your adaptive learning cycle for Indian Polity, one stage at a time.",
      },
    ],
  }),
  component: StudyRoom,
});

type WrongItem = {
  question: string;
  concept_tag: string;
  chosen: string;
  correct: string;
  stage: string;
};

function StageRail({ stage }: { stage: StageKey }) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Learning cycle
        </p>
        <p className="text-xs text-muted-foreground">
          Stage {activeIndex + 1} of {STAGES.length}
        </p>
      </div>
      <Progress value={((activeIndex + 1) / STAGES.length) * 100} className="mt-3 h-1.5" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STAGES.map((s, i) => (
          <span
            key={s.key}
            className={
              i < activeIndex
                ? "rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-medium text-foreground"
                : i === activeIndex
                  ? "rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground"
                  : "rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground"
            }
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  label,
  title,
  children,
}: {
  icon: typeof ScanSearch;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <h2 className="truncate text-lg">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function StudyRoom() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const topicQ = useQuery(focusTopicQuery());
  const topic = topicQ.data;
  const kus = useQuery(knowledgeUnitsQuery(topic?.id)).data ?? [];
  const diagnostics = useQuery(questionsQuery(topic?.id, "diagnostic")).data ?? [];
  const recalls = useQuery(questionsQuery(topic?.id, "recall")).data ?? [];
  const practice = useQuery(questionsQuery(topic?.id, "practice")).data ?? [];
  const pyqs = useQuery(pyqsQuery(topic?.id)).data ?? [];

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<StageKey>("diagnose");
  const [busy, setBusy] = useState(false);

  const [diagAnswer, setDiagAnswer] = useState("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [lesson, setLesson] = useState<TeachResult | null>(null);
  const [recallAnswer, setRecallAnswer] = useState("");
  const [recallResult, setRecallResult] = useState<RecallResult | null>(null);
  const [pyqPick, setPyqPick] = useState<number | null>(null);
  const [pyqRevealed, setPyqRevealed] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practicePick, setPracticePick] = useState<number | null>(null);
  const [practiceRevealed, setPracticeRevealed] = useState(false);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([]);
  const [analysis, setAnalysis] = useState<MistakeAnalysis | null>(null);
  const [mastery, setMastery] = useState<number | null>(null);

  const runDiagnose = useServerFn(aiDiagnose);
  const runTeach = useServerFn(aiTeach);
  const runRecall = useServerFn(aiEvaluateRecall);
  const runAnalysis = useServerFn(aiAnalyseMistakes);

  const diagnosticQuestion = useMemo(
    () => diagnostics.find((q) => optionsOf(q.options).length === 0) ?? diagnostics[0],
    [diagnostics],
  );

  const level = diagnosis?.level ?? "beginner";

  const teachingUnit = useMemo(
    () => kus.find((k) => k.level === level) ?? kus[0],
    [kus, level],
  );

  const recallQuestion = useMemo(
    () => recalls.find((q) => q.level === level) ?? recalls[0],
    [recalls, level],
  );

  const pyq = useMemo(() => {
    if (pyqs.length === 0) return undefined;
    return pyqs.find((p) => p.concept_tag === diagnosis?.focus) ?? pyqs[0];
  }, [pyqs, diagnosis?.focus]);

  const practiceSet = useMemo<Question[]>(() => {
    if (practice.length === 0) return [];
    const matching = practice.filter((q) => q.level === level);
    const rest = practice.filter((q) => q.level !== level);
    return [...matching, ...rest].slice(0, 3);
  }, [practice, level]);

  const ensureSession = async () => {
    if (sessionId || !user || !topic) return sessionId;
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({ user_id: user.id, topic_id: topic.id, kind: "learning", stage: "diagnose" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    setSessionId(data.id);
    return data.id;
  };

  const saveStage = async (next: StageKey, patch: Record<string, unknown> = {}) => {
    setStage(next);
    if (!sessionId) return;
    await supabase.from("study_sessions").update({ stage: next, ...patch }).eq("id", sessionId);
  };

  const fail = (error: unknown) => {
    console.error(error);
    toast.error(error instanceof Error ? error.message : "Something went wrong. Please retry.");
  };

  /* ---------------- stage 1: diagnose ---------------- */
  const submitDiagnostic = async () => {
    if (!user || !topic || !diagnosticQuestion) return;
    if (diagAnswer.trim().length < 5) {
      toast.error("Write at least a sentence — the diagnosis depends on it.");
      return;
    }
    setBusy(true);
    try {
      const sid = await ensureSession();
      const result = await runDiagnose({
        data: {
          topicName: topic.name,
          question: diagnosticQuestion.question_text,
          expected: diagnosticQuestion.explanation ?? "",
          answer: diagAnswer,
        },
      });
      setDiagnosis(result);
      await supabase.from("attempts").insert({
        user_id: user.id,
        session_id: sid,
        topic_id: topic.id,
        question_id: diagnosticQuestion.id,
        kind: "diagnostic",
        user_answer: diagAnswer,
        score: result.score,
        is_correct: result.score >= 60,
        feedback: result.verdict,
      });
      await saveStage("teach", { level: result.level });
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- stage 2: teach ---------------- */
  const generateLesson = async () => {
    if (!topic || !teachingUnit) return;
    setBusy(true);
    try {
      const result = await runTeach({
        data: {
          topicName: topic.name,
          level,
          sourceTitle: teachingUnit.title,
          sourceContent: teachingUnit.content,
          misconceptions: diagnosis?.misconceptions ?? [],
          focus: diagnosis?.focus ?? teachingUnit.title,
        },
      });
      setLesson(result);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  const saveLessonAsNote = async () => {
    if (!user || !topic || !lesson) return;
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      topic_id: topic.id,
      title: lesson.title,
      content: `${lesson.lesson}\n\n**Key points**\n${lesson.key_points
        .map((p) => `- ${p}`)
        .join("\n")}${lesson.memory_hook ? `\n\n**Memory hook:** ${lesson.memory_hook}` : ""}`,
      source: "ai",
    });
    if (error) return fail(error);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    toast.success("Saved to your notes");
  };

  /* ---------------- stage 3: recall ---------------- */
  const submitRecall = async () => {
    if (!user || !topic || !recallQuestion) return;
    setBusy(true);
    try {
      const result = await runRecall({
        data: {
          topicName: topic.name,
          question: recallQuestion.question_text,
          expected: recallQuestion.explanation ?? "",
          answer: recallAnswer,
        },
      });
      setRecallResult(result);
      await supabase.from("attempts").insert({
        user_id: user.id,
        session_id: sessionId,
        topic_id: topic.id,
        question_id: recallQuestion.id,
        kind: "recall",
        user_answer: recallAnswer,
        score: result.score,
        is_correct: result.score >= 60,
        feedback: result.feedback,
      });
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- stage 4: PYQ ---------------- */
  const revealPyq = async () => {
    if (!user || !topic || !pyq || pyqPick === null) return;
    setPyqRevealed(true);
    const correct = pyqPick === pyq.correct_option;
    if (!correct) {
      setWrongItems((prev) => [
        ...prev,
        {
          question: pyq.question_text,
          concept_tag: pyq.concept_tag ?? "fundamental-rights",
          chosen: optionsOf(pyq.options)[pyqPick] ?? "",
          correct: optionsOf(pyq.options)[pyq.correct_option] ?? "",
          stage: `PYQ ${pyq.year}`,
        },
      ]);
    }
    await supabase.from("attempts").insert({
      user_id: user.id,
      session_id: sessionId,
      topic_id: topic.id,
      pyq_id: pyq.id,
      kind: "pyq",
      selected_option: pyqPick,
      is_correct: correct,
      score: correct ? 100 : 0,
    });
  };

  /* ---------------- stage 5: practice ---------------- */
  const revealPractice = async () => {
    const question = practiceSet[practiceIndex];
    if (!user || !topic || !question || practicePick === null) return;
    setPracticeRevealed(true);
    const correct = practicePick === question.correct_option;
    if (correct) setPracticeCorrect((n) => n + 1);
    else
      setWrongItems((prev) => [
        ...prev,
        {
          question: question.question_text,
          concept_tag: question.concept_tag ?? "fundamental-rights",
          chosen: optionsOf(question.options)[practicePick] ?? "",
          correct: optionsOf(question.options)[question.correct_option ?? 0] ?? "",
          stage: "Practice",
        },
      ]);
    await supabase.from("attempts").insert({
      user_id: user.id,
      session_id: sessionId,
      topic_id: topic.id,
      question_id: question.id,
      kind: "practice",
      selected_option: practicePick,
      is_correct: correct,
      score: correct ? 100 : 0,
    });
  };

  const nextPractice = async () => {
    if (practiceIndex + 1 < practiceSet.length) {
      setPracticeIndex((i) => i + 1);
      setPracticePick(null);
      setPracticeRevealed(false);
    } else {
      await saveStage("analysis");
      void runMistakeAnalysis();
    }
  };

  /* ---------------- stage 6 + 7: analyse + revise ---------------- */
  const runMistakeAnalysis = async () => {
    if (!user || !topic) return;
    setBusy(true);
    try {
      const result = await runAnalysis({
        data: {
          topicName: topic.name,
          items: wrongItems,
          recallGaps: recallResult?.gaps ?? [],
        },
      });
      setAnalysis(result);

      const insertedMistakes: string[] = [];
      for (const m of result.mistakes) {
        const { data, error } = await supabase
          .from("mistakes")
          .insert({
            user_id: user.id,
            topic_id: topic.id,
            concept_tag: m.concept_tag,
            mistake_type: m.mistake_type,
            description: m.description,
          })
          .select("id")
          .single();
        if (!error && data) insertedMistakes.push(data.id);
      }

      const due = new Date();
      due.setDate(due.getDate() + 1);
      for (const [index, task] of result.revision.entries()) {
        await supabase.from("revision_tasks").insert({
          user_id: user.id,
          topic_id: topic.id,
          mistake_id: insertedMistakes[index] ?? null,
          title: task.title,
          description: task.description,
          priority: ["high", "medium", "low"].includes(task.priority) ? task.priority : "medium",
          due_date: due.toISOString().slice(0, 10),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["revision_tasks"] });
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- stage 8: mastery ---------------- */
  const finaliseMastery = async () => {
    if (!user || !topic) return;
    setBusy(true);
    try {
      const practiceScore =
        practiceSet.length > 0 ? (practiceCorrect / practiceSet.length) * 100 : 0;
      const value = computeMastery({
        diagnostic: diagnosis?.score ?? 0,
        recall: recallResult?.score ?? 0,
        practice: practiceScore,
      });
      setMastery(value);
      const band = masteryBand(value);
      await supabase.from("mastery_scores").upsert(
        {
          user_id: user.id,
          topic_id: topic.id,
          mastery: value,
          diagnostic_score: diagnosis?.score ?? 0,
          recall_score: recallResult?.score ?? 0,
          practice_score: Math.round(practiceScore),
          attempts_count: 2 + practiceSet.length + (pyq ? 1 : 0),
          correct_count: practiceCorrect + (pyqRevealed && pyqPick === pyq?.correct_option ? 1 : 0),
          level: band.level,
          last_studied_at: new Date().toISOString(),
        },
        { onConflict: "user_id,topic_id" },
      );
      if (sessionId) {
        await supabase
          .from("study_sessions")
          .update({
            stage: "mastery",
            status: "completed",
            score: value,
            total: 100,
            level: diagnosis?.level ?? "beginner",
            completed_at: new Date().toISOString(),
            state: JSON.parse(
              JSON.stringify({
                diagnosis,
                practice_correct: practiceCorrect,
                practice_total: practiceSet.length,
              }),
            ),
          })
          .eq("id", sessionId);
      }
      queryClient.invalidateQueries({ queryKey: ["mastery_scores"] });
      queryClient.invalidateQueries({ queryKey: ["study_sessions"] });
      setStage("mastery");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setSessionId(null);
    setStage("diagnose");
    setDiagAnswer("");
    setDiagnosis(null);
    setLesson(null);
    setRecallAnswer("");
    setRecallResult(null);
    setPyqPick(null);
    setPyqRevealed(false);
    setPracticeIndex(0);
    setPracticePick(null);
    setPracticeRevealed(false);
    setPracticeCorrect(0);
    setWrongItems([]);
    setAnalysis(null);
    setMastery(null);
  };

  if (topicQ.isLoading || !topic) {
    return (
      <AppShell title="AI Study Room" subtitle="Loading your topic…">
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="AI Study Room"
      subtitle={`Indian Polity · ${topic.name}`}
      actions={
        <Button variant="outline" size="sm" onClick={restart}>
          <RotateCcw className="mr-1.5 size-3.5" /> Restart cycle
        </Button>
      }
    >
      <div className="space-y-6">
        <StageRail stage={stage} />

        {/* ---------- DIAGNOSE ---------- */}
        {stage === "diagnose" ? (
          <SectionCard icon={ScanSearch} label="Stage 1 · Diagnose" title="Where are you right now?">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <Badge variant="secondary">Selected topic: {topic.name}</Badge>
              <p className="mt-4 text-[0.95rem] font-medium leading-7">
                {diagnosticQuestion?.question_text ?? "Loading diagnostic question…"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Answer from memory. Guessing honestly is more useful than looking it up.
              </p>
              <Textarea
                value={diagAnswer}
                onChange={(e) => setDiagAnswer(e.target.value)}
                rows={6}
                placeholder="Write what you know…"
                className="mt-4"
              />
              <Button
                onClick={submitDiagnostic}
                disabled={busy || !diagnosticQuestion}
                className="mt-4"
              >
                {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                Submit for diagnosis
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {/* ---------- TEACH ---------- */}
        {stage === "teach" && diagnosis ? (
          <SectionCard
            icon={BookOpen}
            label="Stage 2 · Teach"
            title={`Teaching at ${diagnosis.level} level`}
          >
            <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Diagnosis
                  </p>
                  <p className="mt-2 font-display text-3xl">{diagnosis.score}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">{diagnosis.verdict}</p>
                  <Badge className="mt-3">{diagnosis.level}</Badge>
                </div>
                {diagnosis.misconceptions.length > 0 ? (
                  <div className="rounded-xl border border-destructive/25 bg-destructive-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-destructive">
                      Misconceptions detected
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                      {diagnosis.misconceptions.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {diagnosis.known.length > 0 ? (
                  <div className="rounded-xl border border-success/25 bg-success-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
                      Already solid
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                      {diagnosis.known.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                {lesson ? (
                  <>
                    <h3 className="text-xl">{lesson.title}</h3>
                    <MiniMarkdown text={lesson.lesson} className="mt-2" />
                    {lesson.key_points.length > 0 ? (
                      <div className="mt-5 rounded-lg bg-secondary p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Key points
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                          {lesson.key_points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {lesson.memory_hook ? (
                      <p className="mt-4 flex items-start gap-2 rounded-lg bg-accent-soft p-3 text-sm text-accent-foreground">
                        <Sparkles className="mt-0.5 size-4 shrink-0" />
                        <span>{lesson.memory_hook}</span>
                      </p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button onClick={() => saveStage("recall")}>
                        Test my recall <ArrowRight className="ml-1.5 size-4" />
                      </Button>
                      <Button variant="outline" onClick={saveLessonAsNote}>
                        <NotebookPen className="mr-1.5 size-4" /> Save as note
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      The mentor will now teach{" "}
                      <strong className="text-foreground">{diagnosis.focus}</strong> pitched at your{" "}
                      {diagnosis.level} level.
                    </p>
                    <Button onClick={generateLesson} disabled={busy} className="mt-4">
                      {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                      Teach me this concept
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {/* ---------- RECALL ---------- */}
        {stage === "recall" ? (
          <SectionCard
            icon={BrainCircuit}
            label="Stage 3 · Active recall"
            title="Reproduce it without looking"
          >
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <p className="text-[0.95rem] font-medium leading-7">
                {recallQuestion?.question_text}
              </p>
              <Textarea
                value={recallAnswer}
                onChange={(e) => setRecallAnswer(e.target.value)}
                rows={6}
                disabled={Boolean(recallResult)}
                placeholder="From memory only…"
                className="mt-4"
              />
              {recallResult ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-border bg-secondary p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl">{recallResult.score}%</span>
                      <Badge
                        variant={recallResult.verdict === "strong" ? "default" : "secondary"}
                      >
                        {recallResult.verdict} recall
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6">{recallResult.feedback}</p>
                    {recallResult.gaps.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                        {recallResult.gaps.map((g) => (
                          <li key={g}>{g}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <Button onClick={() => saveStage("pyq")}>
                    Continue to a real UPSC question <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={submitRecall} disabled={busy} className="mt-4">
                  {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                  Evaluate my recall
                </Button>
              )}
            </div>
          </SectionCard>
        ) : null}

        {/* ---------- PYQ ---------- */}
        {stage === "pyq" && pyq ? (
          <SectionCard
            icon={Target}
            label="Stage 4 · Previous year question"
            title={`UPSC ${pyq.exam} ${pyq.year}`}
          >
            <QuestionCard
              questionText={pyq.question_text}
              options={optionsOf(pyq.options)}
              selected={pyqPick}
              onSelect={setPyqPick}
              revealed={pyqRevealed}
              correctOption={pyq.correct_option}
              explanation={pyq.explanation}
              meta={`Asked in ${pyq.year} · ${pyq.difficulty} · ${pyq.concept_tag ?? ""}`}
            />
            <div className="flex flex-wrap gap-2">
              {pyqRevealed ? (
                <Button onClick={() => saveStage("practice")}>
                  Move to practice set <ArrowRight className="ml-1.5 size-4" />
                </Button>
              ) : (
                <Button onClick={revealPyq} disabled={pyqPick === null}>
                  Check answer
                </Button>
              )}
            </div>
          </SectionCard>
        ) : null}

        {/* ---------- PRACTICE ---------- */}
        {stage === "practice" && practiceSet.length > 0 ? (
          <SectionCard
            icon={CheckCircle2}
            label="Stage 5 · Practice"
            title="Calibrated practice questions"
          >
            <QuestionCard
              index={practiceIndex}
              total={practiceSet.length}
              questionText={practiceSet[practiceIndex].question_text}
              options={optionsOf(practiceSet[practiceIndex].options)}
              selected={practicePick}
              onSelect={setPracticePick}
              revealed={practiceRevealed}
              correctOption={practiceSet[practiceIndex].correct_option}
              explanation={practiceSet[practiceIndex].explanation}
              meta={`${practiceSet[practiceIndex].difficulty} · ${practiceSet[practiceIndex].concept_tag ?? ""}`}
            />
            <div className="flex flex-wrap items-center gap-3">
              {practiceRevealed ? (
                <Button onClick={nextPractice} disabled={busy}>
                  {practiceIndex + 1 < practiceSet.length ? "Next question" : "Analyse my mistakes"}
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              ) : (
                <Button onClick={revealPractice} disabled={practicePick === null}>
                  Check answer
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Correct so far: {practiceCorrect}/{practiceIndex + (practiceRevealed ? 1 : 0)}
              </span>
            </div>
          </SectionCard>
        ) : null}

        {/* ---------- ANALYSIS + REVISION ---------- */}
        {stage === "analysis" ? (
          <SectionCard
            icon={Target}
            label="Stage 6 · Analyse mistakes"
            title="What actually went wrong"
          >
            {busy && !analysis ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Analysing your errors…
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Diagnosis of errors
                  </p>
                  <p className="mt-2 text-sm leading-6">{analysis.summary}</p>
                </div>
                {analysis.mistakes.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {analysis.mistakes.map((m, i) => (
                      <div
                        key={`${m.concept_tag}-${i}`}
                        className="rounded-xl border border-border bg-card p-4 shadow-card"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="destructive">{m.mistake_type}</Badge>
                          <span className="text-xs text-muted-foreground">{m.concept_tag}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6">{m.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-success/25 bg-success-soft p-4 text-sm">
                    No conceptual errors in this cycle — clean run.
                  </div>
                )}
                <div className="rounded-xl border border-accent/30 bg-accent-soft p-4 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent-foreground">
                    Stage 7 · Personalised revision created
                  </p>
                  <ul className="mt-3 space-y-3">
                    {analysis.revision.map((r) => (
                      <li key={r.title} className="rounded-lg bg-card p-3">
                        <p className="text-sm font-semibold">{r.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          {r.priority} priority · due tomorrow
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button onClick={finaliseMastery} disabled={busy}>
                  {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                  Calculate my topic mastery
                </Button>
              </div>
            ) : (
              <Button onClick={runMistakeAnalysis}>Analyse my mistakes</Button>
            )}
          </SectionCard>
        ) : null}

        {/* ---------- MASTERY ---------- */}
        {stage === "mastery" && mastery !== null ? (
          <SectionCard icon={Sparkles} label="Stage 8 · Mastery" title="Topic mastery updated">
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
              <p className="font-display text-6xl">{mastery}%</p>
              <Badge className="mt-3">{masteryBand(mastery).label}</Badge>
              <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                Weighted from your diagnostic ({diagnosis?.score ?? 0}%), active recall (
                {recallResult?.score ?? 0}%) and practice accuracy ({practiceCorrect}/
                {practiceSet.length}).
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate({ to: "/mock-tests" })}>
                  Re-test with a mock <ArrowRight className="ml-1.5 size-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/revision" })}>
                  View revision plan
                </Button>
                <Button variant="ghost" onClick={restart}>
                  Run the cycle again
                </Button>
              </div>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
