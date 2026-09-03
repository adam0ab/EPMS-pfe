import { apiClient } from "./client";

export interface AiReference {
  id: string;
  title: string;
}

export interface AiAskResponse {
  answer: string;
  references: AiReference[];
}

export const aiApi = {
  status: () => apiClient.get<{ configured: boolean }>("/ai/status").then((r) => r.data),

  ask: (question: string, procedureId?: string, conversationContext?: string) =>
    apiClient.post<AiAskResponse>("/ai/ask", { question, procedureId, conversationContext }).then((r) => r.data),

  summarize: (procedureId: string) =>
    apiClient.post<{ summary: string }>(`/ai/summarize/${procedureId}`).then((r) => r.data),
};
