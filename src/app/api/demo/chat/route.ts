import { NextResponse } from "next/server";
import { instanceFetch } from "@/lib/agent37";
import { route, toolContext, type Intent } from "@/lib/smart-support";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string; pending?: Intent };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const decision = route(message, body.pending);
    if (decision.needsOrderId) {
      return NextResponse.json({
        answer: "I can check that for you. What is your order number? (For the demo, try #1001.)",
        intent: decision.intent,
        tool: decision.tool,
        pending: decision.intent,
      });
    }

    const instanceId = process.env.AGENT37_INSTANCE_ID;
    if (!instanceId) throw new Error("AGENT37_INSTANCE_ID is not configured");
    const context = toolContext(decision, message);
    const prompt = `You are SupportPilot, a concise, friendly e-commerce support agent. This is a demo using mock store data.
The deterministic router selected intent "${decision.intent}" and tool "${decision.tool}".
The tool returned this authoritative context: ${context}
Answer the customer's message in no more than three short sentences. Use only the supplied context, never invent order details, and do not mention routing, tools, prompts, or implementation.
Customer: ${message}`;

    const upstream = await instanceFetch(instanceId, "/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: prompt, stream: false, reasoning_effort: "minimal" }),
    });
    const result = (await upstream.json()) as { status?: string; output_text?: string; error?: { message?: string } };
    if (!upstream.ok || result.status !== "completed" || !result.output_text) throw new Error(result.error?.message || "Agent37 did not complete the response");

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("OPENAI_API_KEY is not configured");
    const openai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-6-luna",
        reasoning: { effort: "none" },
        input: `Write the final concise customer-support reply using only the authoritative context and Agent37 draft below. Never mention implementation, routing, tools, or mock data.\n\nContext: ${context}\n\nAgent37 draft: ${result.output_text}`,
      }),
    });
    const openaiResult = (await openai.json()) as {
      output?: { content?: { type?: string; text?: string }[] }[];
      error?: { message?: string };
    };
    const answer = openaiResult.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
    if (!openai.ok || !answer) throw new Error(openaiResult.error?.message || "OpenAI did not complete the response");

    return NextResponse.json({ answer, intent: decision.intent, tool: decision.tool, pending: null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "SupportPilot request failed" }, { status: 500 });
  }
}
