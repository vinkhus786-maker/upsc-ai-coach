import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  GraduationCap,
  Layers,
  LineChart,
  RotateCcw,
  ScanSearch,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UPSC AI Mentor — Adaptive Learning for Civil Services" },
      {
        name: "description",
        content:
          "Diagnose, learn, recall, practise and master UPSC topics with an AI mentor that adapts to your level. MVP live for Indian Polity: Fundamental Rights.",
      },
      { property: "og:title", content: "UPSC AI Mentor — Adaptive Learning for Civil Services" },
      {
        property: "og:description",
        content:
          "An AI mentor that diagnoses your level, teaches accordingly, tests recall, analyses mistakes and tracks topic mastery.",
      },
    ],
  }),
  component: Landing,
});

const CYCLE = [
  { icon: ScanSearch, title: "Diagnose", body: "One question exposes what you truly know." },
  { icon: GraduationCap, title: "Teach", body: "The lesson is pitched at your diagnosed level." },
  { icon: BrainCircuit, title: "Active recall", body: "You reproduce it from memory, unaided." },
  { icon: ClipboardCheck, title: "Practice", body: "Real PYQs and calibrated MCQs follow." },
  { icon: Target, title: "Analyse mistakes", body: "Errors are typed: conceptual, factual, applied." },
  { icon: RotateCcw, title: "Revise", body: "A personalised revision task is generated." },
  { icon: Layers, title: "Re-test", body: "Mock tests re-check the same concepts." },
  { icon: LineChart, title: "Master", body: "Mastery is scored, not guessed." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-gradient text-accent-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="truncate font-display text-xl">UPSC AI Mentor</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Start free</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="text-primary-foreground">
            <Badge className="border-0 bg-accent text-accent-foreground">
              MVP live · Indian Polity → Fundamental Rights
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-6xl">
              An AI mentor that teaches you,
              <span className="block italic text-accent">not just answers you.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              Most tools hand you content. UPSC AI Mentor runs a full adaptive learning cycle on every
              topic — it finds your gaps, teaches at your level, forces recall, dissects your mistakes
              and computes real topic mastery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth">
                  Begin diagnostic <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="border border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/auth">See the study room</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-primary-foreground/15 pt-6">
              {[
                ["8-stage", "learning cycle"],
                ["Article-level", "precision"],
                ["Mistake-typed", "analytics"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-xl text-accent">{a}</dt>
                  <dd className="text-xs uppercase tracking-wider text-primary-foreground/60">{b}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-primary-foreground/15 bg-card p-5 shadow-elegant sm:p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Study room · live cycle
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-primary-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Diagnostic
                </p>
                <p className="mt-1 text-sm text-foreground">
                  “Which statement about Fundamental Rights is correct?”
                </p>
              </div>
              <div className="rounded-xl border border-destructive/25 bg-destructive-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Misconception detected
                </p>
                <p className="mt-1 text-sm text-foreground">
                  You believe all Fundamental Rights extend to foreigners. Articles 15, 16, 19, 29 and
                  30 are citizen-only.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                  Teaching at intermediate level
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Part III, Articles 12–35 · six categories · Article 300A after the 44th Amendment…
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-accent-soft p-4">
                <Sparkles className="size-4 shrink-0 text-accent-foreground" />
                <p className="text-sm text-accent-foreground">
                  Mastery recalculated: <strong>62%</strong> → Exam ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl">The cycle behind every topic</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          No topic is “read and forgotten”. Each one moves through eight stages, and your position in
          the cycle decides what the mentor does next.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CYCLE.map((step, index) => (
            <article
              key={step.title}
              className="rounded-xl border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <step.icon className="size-5 text-primary" />
                <span className="font-display text-2xl text-border">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-3 text-lg">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-3">
          {[
            {
              title: "Built for depth, not volume",
              body: "The MVP goes deep on Fundamental Rights — three teaching levels, real PYQs from 2017–2022, and mock tests that re-test the exact concepts you fumbled.",
            },
            {
              title: "Your mistakes become the syllabus",
              body: "Every wrong answer is classified as conceptual, factual, application or misreading, then converted into a dated revision task.",
            },
            {
              title: "Scales to the whole syllabus",
              body: "Subjects, topics and knowledge units are modelled as a tree, so thousands of topics can be added without redesigning anything.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h2 className="font-display text-3xl sm:text-4xl">
          Start with one topic. Master it properly.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Ten minutes from now you'll know exactly which parts of Part III you actually understand.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link to="/auth">
            Create your account <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        UPSC AI Mentor · Adaptive preparation for the Civil Services Examination
      </footer>
    </div>
  );
}
