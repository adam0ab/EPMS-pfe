import { apiClient } from "./client";

export const aiApi = {
  status: () => apiClient.get<{ configured: boolean }>("/ai/status").then((r) => r.data),

  ask: (question: string, procedureId?: string) =>
    apiClient.post<{ answer: string }>("/ai/ask", { question, procedureId }).then((r) => r.data),

  summarize: (procedureId: string) =>
    apiClient.post<{ summary: string }>(`/ai/summarize/${procedureId}`).then((r) => r.data),
};
