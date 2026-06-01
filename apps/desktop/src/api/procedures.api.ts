import { PaginatedResult, ProcedureDTO, ProcedureStatus, ProcedureStep } from "@epms/shared";
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
}

export const proceduresApi = {
  list: (filters: ProcedureFilters) =>
    apiClient
      .get<PaginatedResult<ProcedureDTO>>("/procedures", { params: filters })
      .then((r) => r.data),

  getById: (id: string) => apiClient.get<ProcedureDTO>(`/procedures/${id}`).then((r) => r.data),

  create: (data: ProcedurePayload) =>
    apiClient.post<ProcedureDTO>("/procedures", data).then((r) => r.data),

  update: (id: string, data: Partial<ProcedurePayload>) =>
    apiClient.patch<ProcedureDTO>(`/procedures/${id}`, data).then((r) => r.data),

  publish: (id: string) => apiClient.post<ProcedureDTO>(`/procedures/${id}/publish`).then((r) => r.data),

  archive: (id: string) => apiClient.post<ProcedureDTO>(`/procedures/${id}/archive`).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/procedures/${id}`),
};
