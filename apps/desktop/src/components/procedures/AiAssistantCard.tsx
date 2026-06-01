import { FormEvent, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAiStatus, useAskAi, useSummarizeAi } from "../../hooks/useAi";

export function AiAssistantCard({ procedureId }: { procedureId: string }) {
  const { data: status, isLoading: isStatusLoading } = useAiStatus();
  const summarize = useSummarizeAi();
  const ask = useAskAi();
  const [question, setQuestion] = useState("");

  if (isStatusLoading) return null;

  if (!status?.configured) {
    return (
      <Card className="p-5">
        <h2 className="mb-2 text-sm font-semibold text-secondary dark:text-white">AI Assistant</h2>
        <p className="text-sm text-slate-400">
          Not configured. Set AI_PROVIDER and AI_API_KEY on the server to enable it.
        </p>
      </Card>
    );
  }

  function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    ask.mutate({ question, procedureId });
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary dark:text-white">AI Assistant</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => summarize.mutate(procedureId)}
          disabled={summarize.isPending}
        >
          {summarize.isPending ? "Summarizing…" : "Summarize"}
        </Button>
      </div>

      {summarize.data && (
        <p className="mb-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          {summarize.data.summary}
        </p>
      )}

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this procedure…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-surface-dark-border dark:bg-surface-dark dark:text-slate-100"
        />
        <Button type="submit" size="sm" disabled={ask.isPending}>
          {ask.isPending ? "…" : "Ask"}
        </Button>
      </form>

      {ask.data && (
        <p className="mt-3 whitespace-pre-line rounded-lg bg-primary-50 p-3 text-sm text-secondary dark:bg-primary/5 dark:text-slate-200">
          {ask.data.answer}
        </p>
      )}
      {ask.isError && <p className="mt-2 text-xs text-danger">Couldn't get an answer. Try again.</p>}
    </Card>
  );
}
