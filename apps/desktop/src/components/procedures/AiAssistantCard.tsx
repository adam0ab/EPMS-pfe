import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAiStatus, useAskAi, useSummarizeAi } from "../../hooks/useAi";

type ApiFailure = { response?: { data?: { code?: string; message?: string } } };
type ConversationItem = { question: string; answer: string };
function errorText(error: unknown) {
  const data = (error as ApiFailure | undefined)?.response?.data;
  if (data?.code === "AI_NOT_CONFIGURED") return "The AI Copilot is not configured on the server.";
  return data?.message ?? "Unable to reach the AI service. Please try again in a moment.";
}

export function AiAssistantCard({ procedureId }: { procedureId: string }) {
  const { data: status, isLoading: isStatusLoading, isError: isStatusError } = useAiStatus();
  const ask = useAskAi(); const summarize = useSummarizeAi();
  const [question, setQuestion] = useState(""); const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationItem[]>([]); const responseEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { responseEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [conversation, ask.isPending, ask.isError]);
  if (isStatusLoading) return <Card className="h-36 animate-pulse bg-slate-100 dark:bg-slate-800" />;
  if (isStatusError) return <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Copilot</p><p role="alert" className="mt-3 text-sm text-danger">Unable to check AI service availability.</p></Card>;
  if (!status?.configured) return <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Copilot</p><h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">AI Assistant</h2><p className="mt-2 text-sm text-slate-400">The AI Copilot is not configured. Please configure the AI provider on the server.</p></Card>;
  function send(text: string) { const normalized = text.trim(); if (!normalized || ask.isPending) return; setLastQuestion(normalized); ask.mutate({ question: normalized, procedureId }, { onSuccess: (data) => { setConversation((items) => [...items, { question: normalized, answer: data.answer }]); setQuestion(""); } }); }
  function handleAsk(event: FormEvent) { event.preventDefault(); send(question); }
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(question); } }
  const failure = ask.isError ? errorText(ask.error) : summarize.isError ? errorText(summarize.error) : null;
  return <Card className="p-5"><div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Copilot</p><h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Questions about this procedure</h2><p className="mt-1 text-sm text-slate-500">Ask questions about the actual procedure content.</p></div><Button variant="ghost" size="sm" onClick={() => summarize.mutate(procedureId)} disabled={summarize.isPending}>{summarize.isPending ? "Copilot is thinking…" : "Summarize"}</Button></div>
    {summarize.data && <p className="mb-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">{summarize.data.summary}</p>}
    <div className="mb-3 flex flex-wrap gap-2">{["Explain the steps", "Required documents", "Who is responsible?", "What has changed?"].map((prompt) => <Button key={prompt} variant="ghost" size="sm" onClick={() => setQuestion(prompt)}>{prompt}</Button>)}</div>
    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">{conversation.map((item, index) => <div key={`${item.question}-${index}`} className="space-y-2"><p className="ml-auto max-w-[90%] rounded-lg bg-primary px-3 py-2 text-sm text-white">{item.question}</p><p className="max-w-[95%] whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item.answer}</p></div>)}{ask.isPending && <p role="status" className="w-fit rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800">Copilot is thinking…</p>}{failure && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><p>{failure}</p>{ask.isError && lastQuestion && <Button className="mt-2" variant="ghost" size="sm" onClick={() => send(lastQuestion)}>Retry</Button>}</div>}<div ref={responseEndRef} /></div>
    <form onSubmit={handleAsk} className="mt-4 flex gap-2"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleKeyDown} aria-label="Question about this procedure" placeholder="Ask a question about this procedure…" rows={2} className="min-h-[42px] flex-1 resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-surface-dark-border dark:bg-surface-dark dark:text-slate-100" /><Button type="submit" size="sm" disabled={ask.isPending || !question.trim()}>{ask.isPending ? "…" : "Send"}</Button></form><p className="mt-2 text-xs text-slate-400">Enter to send · Shift+Enter for a new line</p>
  </Card>;
}
