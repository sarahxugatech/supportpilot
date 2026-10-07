"use client";

import { FormEvent, useState } from "react";
import type { Intent } from "@/lib/smart-support";

type Message = { role: "user" | "assistant"; text: string; intent?: Intent; tool?: string };
const suggestions = ["What is your return policy?", "Where is order #1001?", "my package hasn't arrived"];
const intentMeta: Record<Intent, { icon: string; classes: string }> = {
  small_talk: { icon: "💬", classes: "border-violet-200 bg-violet-50 text-violet-700" },
  policy_qa: { icon: "📘", classes: "border-blue-200 bg-blue-50 text-blue-700" },
  product_query: { icon: "🏷️", classes: "border-amber-200 bg-amber-50 text-amber-700" },
  order_query: { icon: "📦", classes: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  review_analysis: { icon: "⭐", classes: "border-orange-200 bg-orange-50 text-orange-700" },
  image_query: { icon: "🖼️", classes: "border-pink-200 bg-pink-50 text-pink-700" },
  web_search: { icon: "🌐", classes: "border-cyan-200 bg-cyan-50 text-cyan-700" },
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Intent>();
  const [busy, setBusy] = useState(false);
  const [dark, setDark] = useState(false);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, pending }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setPending(data.pending || undefined);
      setMessages((current) => [...current, { role: "assistant", text: data.answer, intent: data.intent, tool: data.tool }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: `Demo error: ${error instanceof Error ? error.message : "request failed"}` }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <main className={`min-h-screen px-4 py-8 transition-colors ${dark ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,.10)] dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-lg font-bold text-white shadow-sm ring-1 ring-white/25">S</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SupportPilot</h1>
              <p className="text-sm font-medium text-white/90">The support agent that replaces repetitive tickets.</p>
              <p className="mt-1 text-xs text-white/70">Demo prototype · mock store data</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">● Agent37 Cloud</div>
            <button type="button" onClick={() => setDark((value) => !value)} className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/15 text-sm transition hover:bg-white/25" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </header>

        <details className="group border-b border-slate-200 bg-slate-50/70 px-6 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/70">
          <summary className="cursor-pointer select-none font-semibold text-slate-700 marker:text-indigo-500 dark:text-slate-200">How it works</summary>
          <p className="mt-2 max-w-3xl leading-6 text-slate-600 dark:text-slate-300">
            Every message is routed to one of seven intents: small talk, policy Q&amp;A, product, order, review, image, or web search. The matching tool runs before the agent answers; ambiguous requests trigger a clarifying question.
          </p>
        </details>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-8">
          {messages.length === 0 && (
            <div className="message-enter grid min-h-[300px] place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-3xl shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-950 dark:ring-indigo-800">🎧</div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ready to clear the queue?</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try asking:</p>
                <div className="mt-4 flex max-w-xl flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{suggestion}</button>)}
                </div>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`message-enter flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[88%] items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                {message.role === "assistant" && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white">S</span>}
                <div>
                  <div className={`rounded-2xl px-4 py-3 text-[15px] leading-6 ${message.role === "user" ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"}`}>{message.text}</div>
                  {message.intent && <div className="trace-enter mt-2 flex flex-wrap items-center gap-1.5"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${intentMeta[message.intent].classes}`}><span aria-hidden>{intentMeta[message.intent].icon}</span>{message.intent}</span><span className="text-xs text-slate-400">→</span><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">⚙ {message.tool}</span></div>}
                </div>
              </div>
            </div>
          ))}
          {busy && <div className="message-enter flex items-center gap-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white">S</span><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800" aria-label="SupportPilot is typing"><span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" /><span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:120ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:240ms]" /></div></div>}
        </div>

        <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)} disabled={busy} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm active:translate-y-0 disabled:opacity-50">{suggestion}</button>)}
          </div>
          <form onSubmit={submit} className="flex gap-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={pending ? "Enter your order number…" : "Ask SupportPilot…"} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-indigo-100 focus:border-indigo-500 focus:ring-4 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <button disabled={busy || !input.trim()} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">Send</button>
          </form>
          <p className="mt-3 text-center text-[11px] text-slate-400">Powered by Agent37 Cloud, Supabase &amp; OpenAI · Grounded in deterministic demo tools</p>
        </div>
      </section>
    </main>
  );
}
