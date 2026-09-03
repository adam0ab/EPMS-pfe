import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAskAi, useAiStatus } from "../hooks/useAi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Role } from "@epms/shared";
import { useAuthStore } from "../store/auth.store";
import { ChecklistButton } from "../components/procedures/ChecklistButton";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  references: Array<{ id: string; title: string }>;
  timestamp: Date;
  isError?: boolean;
};

type ApiFailure = { response?: { data?: { code?: string; message?: string } } };

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function errorText(error: unknown) {
  const data = (error as ApiFailure | undefined)?.response?.data;
  if (data?.code === "AI_NOT_CONFIGURED") return "The AI Copilot is not configured on the server.";
  return data?.message ?? "Unable to reach the AI service. Please try again in a moment.";
}

function parseMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h4 key={key++} className="mb-1 mt-3 text-sm font-semibold text-secondary dark:text-white">{line.slice(4)}</h4>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={key++} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300">{line.slice(2)}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++} className="text-sm font-semibold text-secondary dark:text-white">{line.replace(/\*\*/g, "")}</p>);
    } else {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={key++} className="text-sm text-slate-700 dark:text-slate-300">
          {parts.map((part, idx) => (idx % 2 === 1 ? <strong key={idx} className="font-semibold text-secondary dark:text-white">{part}</strong> : part))}
        </p>
      );
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

const SUGGESTIONS = [
  "How do I enroll?",
  "How do I submit my final year project?",
  "How do I get an administrative document?",
  "What are the validation deadlines?",
  "How do I submit an appeal?",
];

export default function AssistantIA() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [procedureContextId, setProcedureContextId] = useState<string | undefined>();
  const ask = useAskAi();
  const { data: status } = useAiStatus();
  const suggestions = role === Role.EMPLOYEE
    ? ["How do I process a student request?", "What documents are required?", "Show me relevant administrative procedures", "Which department handles this?"]
    : ["How do I replace my student card?", "What documents do I need?", "Show me internship procedures", "What do I need to do next?"];
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  function send(text: string) {
    const normalized = text.trim();
    if (!normalized || ask.isPending) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: normalized,
      references: [],
      timestamp: new Date(),
    };

    setLastQuestion(normalized);
    setMessages((items) => [...items, userMessage]);
    setInput("");
    setIsTyping(true);

    ask.mutate({ question: normalized, procedureId: procedureContextId, conversationContext: lastQuestion ?? undefined }, {
      onSuccess: (data) => {
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: data.answer,
          references: data.references ?? [],
          timestamp: new Date(),
        };
        setMessages((items) => [...items, assistantMessage]);
        if (data.references?.[0]) setProcedureContextId(data.references[0].id);
        setIsTyping(false);
      },
      onError: () => {
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: errorText(ask.error),
          references: [],
          timestamp: new Date(),
          isError: true,
        };
        setMessages((items) => [...items, errorMessage]);
        setIsTyping(false);
      },
    });
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!input.trim() || ask.isPending) return;
    send(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function clearConversation() {
    setMessages([]);
    setLastQuestion(null);
    setProcedureContextId(undefined);
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-5xl flex-col">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-secondary dark:text-white">EPMS Administrative Copilot</h1>
        <p className="text-sm text-slate-500">Ask about procedures, documents, steps, deadlines, or departments.</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-surface-dark-border">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">AI</div>
            <div>
              <span className="text-sm font-semibold text-secondary dark:text-white">EPMS Administrative Copilot</span>
              <p className="text-xs text-slate-500">{status?.configured ? "Online" : "Not configured"}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={clearConversation} disabled={messages.length === 0}>
            New conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
          {!messages.length && !isTyping && (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">🤖</div>
              <h2 className="text-xl font-semibold text-secondary dark:text-white">{role === Role.EMPLOYEE ? "How can I help with an administrative procedure?" : "How can I help with your administrative procedures?"}</h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                {role === Role.EMPLOYEE ? "Ask about execution steps, required documents, deadlines, departments, or the right procedure to consult." : "Ask about the procedure you need, required documents, steps, deadlines, or what to do next."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary dark:hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 px-6 py-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      message.role === "user" ? "bg-primary text-white" : message.isError ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {message.role === "user" ? "MOI" : message.isError ? "!" : "AI"}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-primary text-white"
                        : message.isError
                          ? "rounded-tl-sm border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                          : "rounded-tl-sm bg-white dark:bg-slate-800"
                    }`}
                  >
                    {message.role === "assistant" && !message.isError ? (
                      <div className="text-sm text-slate-700 dark:text-slate-200">{parseMarkdown(message.content)}</div>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-200">{message.content}</p>
                    )}
                    {message.references.length > 0 && <div className="mt-4 space-y-2">{message.references.map((ref) => <div key={ref.id} className="rounded-xl border border-primary/20 bg-primary-50/40 p-3 dark:border-primary/30 dark:bg-primary/10"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Published EPMS procedure</p><p className="mt-1 font-semibold text-secondary dark:text-white">{ref.title}</p><p className="mt-1 text-xs text-slate-500">Based on the published procedure in EPMS.</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => navigate(`/procedures/${ref.id}`)}>Open Procedure</Button>{role === Role.STUDENT && <ChecklistButton procedureId={ref.id} status={"published" as any} role={role} />}</div></div>)}</div>}
                    <p className={`mt-2 text-right text-[10px] ${message.role === "user" ? "text-white/70" : "text-slate-400"}`}>{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">AI</div>
                  <div className="rounded-tl-sm bg-white px-4 py-3 dark:bg-slate-800">
                    <p className="mb-2 text-sm text-slate-500">Analyzing your request...</p>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 dark:border-surface-dark-border dark:bg-slate-900">
          {ask.isError && lastQuestion && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-xs text-red-700 dark:text-red-300">{errorText(ask.error)}</p>
              <Button size="sm" variant="ghost" onClick={() => send(lastQuestion)} disabled={ask.isPending}>
                Retry
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!status?.configured}
              placeholder={status?.configured ? "What do you need help with?" : "AI assistant not configured"}
              rows={1}
              className="min-h-[48px] max-h-32 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-surface-dark-border dark:bg-surface-dark dark:text-slate-100"
            />
            <Button type="submit" size="sm" disabled={!input.trim() || ask.isPending || !status?.configured} className="h-12 px-6">
              {ask.isPending ? "…" : "Send"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Enter to send · Shift+Enter for a new line</p>
        </form>
      </Card>
    </div>
  );
}
