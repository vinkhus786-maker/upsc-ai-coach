// Server-only helper for calling the Lovable AI Gateway.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AiGatewayError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call(messages: ChatMessage[], json: boolean): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new AiGatewayError("AI is not configured for this project.", 500);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (res.status === 429)
    throw new AiGatewayError("The mentor is handling too many requests. Try again in a moment.", 429);
  if (res.status === 402)
    throw new AiGatewayError("AI credits are exhausted. Please top up to continue.", 402);
  if (!res.ok) {
    const text = await res.text();
    console.error("[ai-gateway]", res.status, text);
    throw new AiGatewayError("The mentor could not answer right now.", res.status);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function askText(system: string, user: string): Promise<string> {
  return call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    false,
  );
}

export async function askChat(messages: ChatMessage[]): Promise<string> {
  return call(messages, false);
}

export async function askJson<T>(system: string, user: string, fallback: T): Promise<T> {
  const raw = await call(
    [
      { role: "system", content: `${system}\n\nRespond with a single valid JSON object only.` },
      { role: "user", content: user },
    ],
    true,
  );
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
    return { ...fallback, ...(JSON.parse(cleaned) as Partial<T>) } as T;
  } catch {
    console.error("[ai-gateway] unparseable JSON:", raw.slice(0, 500));
    return fallback;
  }
}

export const MENTOR_PERSONA = `You are "UPSC AI Mentor", a rigorous but warm mentor for Indian Civil Services (UPSC CSE) aspirants.
You teach adaptively: you diagnose what the student already knows, correct misconceptions explicitly, and only then teach.
You are factually precise about the Constitution of India: article numbers, amendment numbers with years, and landmark case names with years.
You never invent case law or article numbers. Keep language crisp, exam-oriented, and free of flattery.`;
