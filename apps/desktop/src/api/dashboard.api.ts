import { apiClient } from "./client";

export interface DashboardStats {
  totalProcedures: number;
  publishedProcedures: number;
  archivedProcedures: number;
  draftProcedures: number;
  proceduresByDepartment: { department: string; count: number }[];
  proceduresByCategory: { category: string; group: string; count: number }[];
  recentlyUpdated: Array<{
    _id: string;
    title: string;
    status: string;
    updatedAt: string;
    department: { name: string };
    category: { name: string };
  }>;
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
};
