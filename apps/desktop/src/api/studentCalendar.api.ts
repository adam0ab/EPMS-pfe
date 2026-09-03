import { ProcedureDTO } from "@epms/shared";
import { apiClient } from "./client";

export const studentCalendarApi = {
  list: () => apiClient.get<ProcedureDTO[]>("/student-calendar").then((response) => response.data),
  add: (procedureId: string) => apiClient.post<ProcedureDTO>(`/student-calendar/${procedureId}`).then((response) => response.data),
  remove: (procedureId: string) => apiClient.delete(`/student-calendar/${procedureId}`),
};
