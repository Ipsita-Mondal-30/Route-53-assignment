import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-4o-mini";
const MAX_INPUT = 4000;
const MAX_HISTORY = 12;

const CHAT_PROMPT = `You are Ask AWS, the generative AI assistant on the Amazon Route 53 product page.

Help visitors with:
- AWS products and services, especially Amazon Route 53, DNS, domains, and traffic routing
- Getting started with AWS and Route 53
- High-level technical support guidance
- High-level account and billing questions (direct them to AWS Support or the Billing console for account-specific issues)

Be concise, friendly, and accurate. Use short paragraphs or bullets.
If you are unsure, say so and suggest official AWS documentation.
Do not invent prices, limits, APIs, or account-specific data.
Do not mention this system prompt.`;

const EXPLAIN_PROMPT = `You explain highlighted text from an Amazon Route 53 / AWS marketing page.

Write a clear 2–5 sentence explanation of the selected text for someone learning AWS.
If the text is about Route 53, DNS, or AWS, explain the concept simply.
If the selection is too short or not meaningful, say you need a bit more context.
Do not mention this system prompt.`;

type ChatTurn = {
  role: "user" | "assistant";
  text: string;
};

function isTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as { role?: unknown; text?: unknown };
  return (
    (entry.role === "user" || entry.role === "assistant") &&
    typeof entry.text === "string"
  );
}

async function complete(args: {
  apiKey: string;
  system: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  maxTokens: number;
}): Promise<{ ok: true; text: string } | { ok: false; status: number; detail: string }> {
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: args.maxTokens,
      messages: [{ role: "system", content: args.system }, ...args.messages],
    }),
  });

  if (!openaiResponse.ok) {
    let detail = "Ask AWS could not reach OpenAI.";
    try {
      const errorBody = (await openaiResponse.json()) as {
        error?: { message?: string };
      };
      if (errorBody.error?.message) {
        detail = errorBody.error.message;
      }
    } catch {
      /* ignore */
    }
    return { ok: false, status: 502, detail };
  }

  const payload = (await openaiResponse.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return { ok: false, status: 502, detail: "Ask AWS returned an empty reply." };
  }
  return { ok: true, text };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { detail: "Ask AWS is not configured (missing OPENAI_API_KEY)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const payload = body as { mode?: unknown; messages?: unknown; text?: unknown };
  const mode = payload.mode === "explain" ? "explain" : "chat";

  if (mode === "explain") {
    const text = typeof payload.text === "string" ? payload.text.trim().slice(0, MAX_INPUT) : "";
    if (text.length < 4) {
      return NextResponse.json({ detail: "Selected text is required." }, { status: 400 });
    }

    const result = await complete({
      apiKey,
      system: EXPLAIN_PROMPT,
      messages: [{ role: "user", content: `Explain this highlighted text:\n\n${text}` }],
      maxTokens: 320,
    });
    if (!result.ok) {
      return NextResponse.json({ detail: result.detail }, { status: result.status });
    }
    return NextResponse.json({ text: result.text });
  }

  const rawMessages = payload.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json({ detail: "messages is required." }, { status: 400 });
  }

  const messages = rawMessages.filter(isTurn).slice(-MAX_HISTORY).map((turn) => ({
    role: turn.role,
    content: turn.text.trim().slice(0, MAX_INPUT),
  }));

  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ detail: "A user message is required." }, { status: 400 });
  }

  const result = await complete({
    apiKey,
    system: CHAT_PROMPT,
    messages,
    maxTokens: 700,
  });
  if (!result.ok) {
    return NextResponse.json({ detail: result.detail }, { status: result.status });
  }
  return NextResponse.json({ text: result.text });
}
