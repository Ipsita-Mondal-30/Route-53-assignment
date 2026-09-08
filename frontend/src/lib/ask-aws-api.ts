import { ApiError, parseDetail } from "@/lib/api";

export type AskAwsTurn = {
  role: "user" | "assistant";
  text: string;
};

async function postAskAws(body: unknown): Promise<string> {
  const response = await fetch("/api/ask-aws", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseDetail(response));
  }

  const data = (await response.json()) as { text?: string };
  if (!data.text?.trim()) {
    throw new ApiError(502, "Ask AWS returned an empty reply.");
  }
  return data.text.trim();
}

export async function askAwsChat(messages: AskAwsTurn[]): Promise<string> {
  return postAskAws({ mode: "chat", messages });
}

export async function explainSelection(text: string): Promise<string> {
  return postAskAws({ mode: "explain", text });
}
