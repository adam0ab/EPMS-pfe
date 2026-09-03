import { PaginatedResult, ProcedureAudience, ProcedureDTO, ProcedureStatus, ProcedureStep, ProcedureVersionDTO, ValidationHistoryDTO } from "@epms/shared";
import { apiClient } from "./client";

export interface ProcedureFilters {
  search?: string;
  department?: string;
  category?: string;
  keyword?: string;
  status?: string;
  versionNumber?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  health?: string;
  page?: number;
  pageSize?: number;
}

export interface ProcedurePayload {
  title: string;
  description: string;
  department: string;
  category: string;
  keywords?: string[];
  requiredDocuments?: string[];
  steps?: ProcedureStep[];
  responsiblePerson: string;
  effectiveDate: string;
  versionNumber?: string;
  status?: ProcedureStatus;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  showInCalendar?: boolean;
  eventType?: string;
  targetAudience?: ProcedureAudience[];
}

export const proceduresApi = {
  list: (filters: ProcedureFilters) =>
    apiClient
      .get<PaginatedResult<ProcedureDTO>>("/procedures", { params: filters })
      .then((r) => r.data),

  getById: (id: string) => apiClient.get<ProcedureDTO>(`/procedures/${id}`).then((r) => r.data),

  recommendations: (id: string) => apiClient.get<ProcedureDTO[]>(`/procedures/${id}/recommendations`).then((r) => r.data),

  validationHistory: (id: string) =>
    apiClient.get<ValidationHistoryDTO[]>(`/procedures/${id}/validation-history`).then((r) => r.data),

  versions: (id: string) => apiClient.get<ProcedureVersionDTO[]>(`/procedures/${id}/versions`).then((r) => r.data),
  restoreVersion: (id: string, versionId: string) => apiClient.post<ProcedureDTO>(`/procedures/${id}/versions/${versionId}/restore`).then((r) => r.data),

  create: (data: ProcedurePayload) =>
    apiClient.post<ProcedureDTO>("/procedures", data).then((r) => r.data),

  createRevision: (id: string) =>
    apiClient.post<ProcedureDTO>(`/procedures/${id}/revision`).then((r) => r.data),

  update: (id: string, data: Partial<ProcedurePayload>) =>
    apiClient.patch<ProcedureDTO>(`/procedures/${id}`, data).then((r) => r.data),

  submitForReview: (id: string, comment?: string) =>
    apiClient.post<ProcedureDTO>(`/procedures/${id}/submit-review`, { comment }).then((r) => r.data),

  approve: (id: string, comment?: string) =>
    apiClient.post<ProcedureDTO>(`/procedures/${id}/approve`, { comment }).then((r) => r.data),

  reject: (id: string, comment: string) =>
    apiClient.post<ProcedureDTO>(`/procedures/${id}/reject`, { comment }).then((r) => r.data),

  publish: (id: string) => apiClient.post<ProcedureDTO>(`/procedures/${id}/publish`).then((r) => r.data),

  archive: (id: string) => apiClient.post<ProcedureDTO>(`/procedures/${id}/archive`).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/procedures/${id}`),
};
