import { apiClient } from "./client";

export interface StudentChecklist {
  _id: string;
  procedure: { _id: string; title: string; category?: { name?: string; group?: string } | string | null; status: string; versionNumber: string };
  steps: Array<{ order: number; description: string; completed: boolean }>;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export const studentChecklistsApi = {
  list: () => apiClient.get<StudentChecklist[]>("/student-checklists").then((response) => response.data),
  attention: () => apiClient.get<StudentChecklist[]>("/student-checklists/attention").then((response) => response.data),
  add: (procedureId: string) => apiClient.post<StudentChecklist>(`/student-checklists/${procedureId}`).then((response) => response.data),
  setStepCompletion: (procedureId: string, stepOrder: number, completed: boolean) =>
    apiClient.patch<StudentChecklist>(`/student-checklists/${procedureId}/steps/${stepOrder}`, { completed }).then((response) => response.data),
};
