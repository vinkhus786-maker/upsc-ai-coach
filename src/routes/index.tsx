import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Clock3,
  GraduationCap,
  Play,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
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

const stats = [
  { value: "10k+", label: "Questions" },
  { value: "2.5k+", label: "PYQs" },
  { value: "500+", label: "Topics" },
  { value: "11", label: "AI Agents" },
];

const features = [
  {
    icon: BrainCircuit,
    title: "AI Mentor",
    body: "A calm, highly precise guide that adapts explanations to your current understanding.",
  },
  {
    icon: Zap,
    title: "Adaptive Learning",
    body: "Every next step is tuned to your gaps, confidence and recall patterns.",
  },
  {
    icon: ScanSearch,
    title: "PYQ Intelligence",
    body: "Turn previous year questions into a living map of the most exam-relevant concepts.",
  },
  {
    icon: RotateCcw,
    title: "Revision Planner",
    body: "Build scientifically spaced review loops that defend memory beyond the first read.",
  },
  {
    icon: BarChart3,
    title: "Memory Engine",
    body: "Active recall and retrieval practice become a durable study rhythm.",
  },
  {
    icon: ShieldCheck,
    title: "Mock Test AI",
    body: "Simulate real exam pressure with diagnostics that reveal what to fix next.",
  },
];

const pillars = [
  {
    title: "Diagnose before you study",
    body: "A single interaction reveals where your understanding is strong, vague or dangerously confident.",
  },
  {
    title: "Teach at the right level",
    body: "Concepts are introduced simply, stretched deeper and retested until the foundation is stable.",
  },
  {
    title: "Track readiness with precision",
    body: "Your exam readiness is estimated from recall, performance and revision history, not guesswork.",
  },
];

function Landing() {
  return (
    <div className="landing-shell min-h-screen overflow-x-hidden text-foreground">
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/55 px-4 py-3 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#f5c96a,#d89e2d)] text-slate-950 shadow-[0_8px_30px_-8px_rgba(245,201,106,0.45)]">
              <GraduationCap className="size-5" />
            </span>
            <span className="truncate font-display text-lg tracking-tight text-white">UPSC AI Mentor</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full px-4 text-slate-200 hover:bg-white/10 hover:text-white">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-[linear-gradient(135deg,#f6ca6a,#d89e2d)] px-4 text-slate-950 shadow-[0_10px_30px_-12px_rgba(245,201,106,0.55)] hover:opacity-95">
              <Link to="/auth">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24 lg:pt-6">
          <div className="hero-shell mx-auto min-h-[calc(100vh-104px)] max-w-7xl overflow-hidden rounded-[36px] border border-white/10 px-4 py-10 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.7)] sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div className="absolute inset-0 hero-grid opacity-90" />
            <div className="absolute left-[-10%] top-[-6%] h-72 w-72 rounded-full bg-[#f3c46b]/20 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_60%)] opacity-60" />

            <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.33em] text-[#f5c96a] shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                  <Sparkles className="size-3.5" />
                  New · Adaptive AI Mentor for UPSC CSE
                </div>
                <h1 className="mt-6 max-w-4xl text-4xl leading-[0.95] text-white sm:text-5xl lg:text-7xl">
                  India&apos;s First Adaptive AI Mentor for UPSC CSE
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  The AI that diagnoses your weaknesses, teaches at your level, builds memory
                  scientifically and predicts your exam readiness.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full bg-[linear-gradient(135deg,#f6ca6a,#d89e2d)] px-6 text-slate-950 shadow-[0_12px_45px_-14px_rgba(245,201,106,0.55)] hover:opacity-95">
                    <Link to="/auth">
                      Start Learning <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/20"
                  >
                    <Play className="mr-2 size-4" /> Watch Demo
                  </a>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className="hero-stat rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur-xl"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="font-display text-2xl text-[#f5c96a]">{stat.value}</div>
                      <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="glass-panel rounded-[30px] p-4 sm:p-6">
                  <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-5 text-white sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#f5c96a]">Live readiness</p>
                        <p className="mt-2 font-display text-2xl">Today&apos;s AI coaching</p>
                      </div>
                      <div className="inline-flex items-center rounded-full border border-[#f5c96a]/25 bg-[#f5c96a]/10 px-3 py-1 text-sm text-[#f5c96a]">
                        <Clock3 className="mr-1 inline size-3.5" /> 12 min
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>Current focus</span>
                          <span className="text-[#f5c96a]">Fundamental Rights</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-200">
                          “Which rights are enforceable against the State and which are citizen-only?”
                        </p>
                      </div>

                      <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
                        <div className="flex items-center justify-between text-sm text-rose-200">
                          <span>Weakness detected</span>
                          <span>2 gaps</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-200">
                          Article 15 and Article 19 are often conflated in your recall patterns.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#f5c96a]/20 bg-[#f5c96a]/10 p-4">
                        <div className="flex items-center justify-between text-sm text-[#f5c96a]">
                          <span>Readiness score</span>
                          <span>82%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div className="h-2 w-[82%] rounded-full bg-[linear-gradient(90deg,#f5c96a,#f0d18b)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="reveal-up">
              <Badge className="border border-[#f5c96a]/20 bg-[#f5c96a]/10 text-[#f5c96a]">
                Premium study intelligence
              </Badge>
              <h2 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl">
                A study room that feels like a world-class mentor, not a content dump.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-400">
                Every concept becomes a guided experience: diagnose, teach, retrieve, revise and predict.
                The result is a calmer, sharper prep rhythm built for UPSC depth.
              </p>

              <div className="mt-8 space-y-3">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles className="size-4 text-[#f5c96a]" /> {pillar.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{pillar.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="section-card rounded-[24px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.7)]"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl bg-[#f5c96a]/10 p-3 text-[#f5c96a]">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-400">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-xl text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,26,46,0.95),rgba(7,17,31,0.95))] p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)] sm:p-10 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Badge className="border border-[#f5c96a]/20 bg-[#f5c96a]/10 text-[#f5c96a]">
                  Built for the real exam
                </Badge>
                <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">
                  Start with one topic. Build the memory that lasts.
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-400">
                  From the first diagnostic question to the final revision loop, the experience stays calm,
                  intelligent and highly personal.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-[linear-gradient(135deg,#f6ca6a,#d89e2d)] text-slate-950">
                  <Link to="/auth">
                    Create your account <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/auth">Explore the study room</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        UPSC AI Mentor · Adaptive preparation for the Civil Services Examination
      </footer>
    </div>
  );
}
