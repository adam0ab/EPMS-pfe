import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "../api/ai.api";

export function useAiStatus() {
  return useQuery({ queryKey: ["ai-status"], queryFn: aiApi.status, staleTime: 5 * 60_000 });
}

export function useAskAi() {
  return useMutation({
    mutationFn: ({ question, procedureId }: { question: string; procedureId?: string }) =>
      aiApi.ask(question, procedureId),
  });
}

export function useSummarizeAi() {
  return useMutation({
    mutationFn: (procedureId: string) => aiApi.summarize(procedureId),
  });
}
