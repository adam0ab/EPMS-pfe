import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "../api/ai.api";

export function useAiStatus() {
  return useQuery({ queryKey: ["ai-status"], queryFn: aiApi.status, staleTime: 5 * 60_000 });
}

export function useAskAi() {
  return useMutation({
    mutationFn: ({ question, procedureId, conversationContext }: { question: string; procedureId?: string; conversationContext?: string }) =>
      aiApi.ask(question, procedureId, conversationContext),
  });
}

export function useSummarizeAi() {
  return useMutation({
    mutationFn: (procedureId: string) => aiApi.summarize(procedureId),
  });
}
