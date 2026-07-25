import { askChat, askJson, askText, MENTOR_PERSONA } from "./ai-gateway.server";
import type {
  DiagnosisResult,
  MistakeAnalysis,
  RecallResult,
  TeachResult,
} from "./ai.functions";

export async function diagnose(input: {
  topicName: string;
  question: string;
  expected: string;
  answer: string;
}): Promise<DiagnosisResult> {
  return askJson<DiagnosisResult>(
    `${MENTOR_PERSONA}

You are running the DIAGNOSE stage. Judge the student's prior knowledge of the topic from a single answer.
Be honest: a vague or partially right answer is "beginner". A structurally correct answer missing nuance is "intermediate". A precise answer with articles, amendments or case names is "advanced".
Return JSON with keys: level ("beginner"|"intermediate"|"advanced"), score (0-100 integer), verdict (one sentence addressed to the student), misconceptions (array of short specific wrong beliefs detected, empty if none), known (array of things the student clearly already knows), focus (the single concept to teach next).`,
    `Topic: ${input.topicName}
Diagnostic question: ${input.question}
Model answer / marking notes: ${input.expected}
Student's answer: ${input.answer || "(left blank)"}`,
    {
      level: "beginner",
      score: 0,
      verdict: "Let's build this topic up from the foundations.",
      misconceptions: [],
      known: [],
      focus: "Structure of Part III",
    },
  );
}

export async function teach(input: {
  topicName: string;
  level: string;
  sourceTitle: string;
  sourceContent: string;
  misconceptions: string[];
  focus: string;
}): Promise<TeachResult> {
  return askJson<TeachResult>(
    `${MENTOR_PERSONA}

You are running the TEACH stage. Explain the concept at exactly the student's diagnosed level, using ONLY facts supported by the reference material given (you may add well-known standard UPSC facts, but never invent article numbers, amendments or cases).
If misconceptions are listed, open by correcting them explicitly in one short paragraph titled with "Correcting first:".
Write the lesson in simple markdown: short paragraphs, **bold** for terms, numbered or bulleted lists where a list is natural. 300-450 words.
Return JSON with keys: title, lesson (markdown string), key_points (4-6 crisp revision-ready bullets), memory_hook (one mnemonic or one-line trick).`,
    `Topic: ${input.topicName}
Student level: ${input.level}
Concept to focus on: ${input.focus}
Misconceptions to correct: ${input.misconceptions.length ? input.misconceptions.join("; ") : "none detected"}

Reference material — "${input.sourceTitle}":
${input.sourceContent}`,
    {
      title: input.sourceTitle,
      lesson: input.sourceContent,
      key_points: [],
      memory_hook: "",
    },
  );
}

export async function evaluateRecall(input: {
  topicName: string;
  question: string;
  expected: string;
  answer: string;
}): Promise<RecallResult> {
  return askJson<RecallResult>(
    `${MENTOR_PERSONA}

You are running the ACTIVE RECALL stage. Grade the student's recall against the expected answer.
Return JSON with keys: score (0-100 integer), verdict (one of "strong", "partial", "weak"), feedback (2-4 sentences, name exactly what was missed and supply the correct fact), gaps (array of specific missing facts).`,
    `Topic: ${input.topicName}
Recall question: ${input.question}
Expected answer: ${input.expected}
Student's recall: ${input.answer || "(left blank)"}`,
    {
      score: 0,
      verdict: "weak",
      feedback: "Revisit the lesson and try to reproduce it from memory once more.",
      gaps: [],
    },
  );
}

export async function analyseMistakes(input: {
  topicName: string;
  items: Array<{
    question: string;
    concept_tag: string;
    chosen: string;
    correct: string;
    stage: string;
  }>;
  recallGaps: string[];
}): Promise<MistakeAnalysis> {
  if (input.items.length === 0 && input.recallGaps.length === 0) {
    return {
      summary:
        "No incorrect answers in this cycle. Your errors are not conceptual — keep the pace and move to timed practice.",
      mistakes: [],
      revision: [
        {
          title: `Spaced revision: ${input.topicName}`,
          description:
            "Re-read your key points and attempt 5 fresh PYQs under a 90-second-per-question limit to lock in retention.",
          priority: "low",
        },
      ],
    };
  }

  return askJson<MistakeAnalysis>(
    `${MENTOR_PERSONA}

You are running the ANALYSE MISTAKES stage. Classify each error and design personalised revision.
mistake_type must be one of: "conceptual" (the underlying idea is wrong), "factual" (article/amendment/case detail wrong), "application" (knows the fact, misapplied it), "misreading" (misread the question stem).
Return JSON with keys: summary (2-3 sentences naming the single biggest leak), mistakes (array of {concept_tag, mistake_type, description} — description says what the student believed vs the truth), revision (1-3 items of {title, description, priority: "high"|"medium"|"low"} — each description is a concrete 10-20 minute task).`,
    `Topic: ${input.topicName}
Wrong answers:
${input.items
  .map(
    (i, n) =>
      `${n + 1}. [${i.stage} | ${i.concept_tag}] Q: ${i.question}\n   Student chose: ${i.chosen}\n   Correct: ${i.correct}`,
  )
  .join("\n")}
Recall gaps: ${input.recallGaps.length ? input.recallGaps.join("; ") : "none"}`,
    {
      summary: "Review the questions you missed and re-read the relevant articles.",
      mistakes: input.items.map((i) => ({
        concept_tag: i.concept_tag,
        mistake_type: "conceptual",
        description: `Incorrect answer on: ${i.question.slice(0, 120)}`,
      })),
      revision: [
        {
          title: `Re-study weak areas in ${input.topicName}`,
          description: "Re-read the lesson key points and re-attempt the questions you got wrong.",
          priority: "high",
        },
      ],
    },
  );
}

export async function mentorChat(input: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  profileSummary: string;
}): Promise<{ reply: string }> {
  const reply = await askChat([
    {
      role: "system",
      content: `${MENTOR_PERSONA}

You are in mentor chat. Use the student's live performance data below to make advice specific, not generic.
Answer in markdown, under 250 words unless asked for depth. If the student asks something outside Indian Polity → Fundamental Rights, answer briefly and note that the current MVP is optimised for Fundamental Rights.

Student snapshot:
${input.profileSummary}`,
    },
    ...input.messages.slice(-12),
  ]);
  return { reply: reply || "I could not answer that just now. Please try again." };
}

export async function summariseNote(input: {
  topicName: string;
  lesson: string;
}): Promise<string> {
  return askText(
    `${MENTOR_PERSONA}\nCondense the lesson into exam-ready revision notes in markdown: a one-line definition, then 6-10 bullet facts with article numbers, then a "Traps" line.`,
    `Topic: ${input.topicName}\n\n${input.lesson}`,
  );
}
