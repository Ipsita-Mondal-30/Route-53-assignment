import { ApiError, parseDetail } from "@/lib/api";

export type AmazonQTurn = {
  role: "user" | "assistant";
  text: string;
};

export async function askAmazonQ(messages: AmazonQTurn[]): Promise<string> {
  const response = await fetch("/api/amazon-q", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseDetail(response));
  }

  const data = (await response.json()) as { text?: string };
  if (!data.text?.trim()) {
    throw new ApiError(502, "Amazon Q returned an empty reply.");
  }
  return data.text.trim();
}
