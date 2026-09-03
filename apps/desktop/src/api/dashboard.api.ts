import { apiClient } from "./client";
import { ProcedureDTO, ProcedureStatus } from "@epms/shared";

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

export interface ValidatorDashboardStats {
  pendingProcedures: number;
  approvedProcedures: number;
  rejectedProcedures: number;
  recentlySubmitted: Array<{
    _id: string; title: string; status: string; submittedAt?: string; description: string;
    department: { name: string }; category: { name: string };
    createdBy?: { fullName: string; email: string } | string;
  }>;
  recentValidationActivity: Array<{
    _id: string; action: string; comment?: string; createdAt: string;
    actor?: { fullName: string };
    procedureId?: { _id: string; title: string; status: string };
  }>;
}

export interface AdminDashboardStats {
  procedureCounts: Record<string, number>;
  userCount: number;
  documentCount: number;
  proceduresByDepartment: DashboardStats["proceduresByDepartment"];
  proceduresByCategory: DashboardStats["proceduresByCategory"];
  mostViewed: DashboardStats["recentlyUpdated"];
  validationCounts: Record<string, number>;
  recentActivity: Array<{ _id: string; action: string; entityType: string; createdAt: string; actor?: { fullName: string } }>;
}

export interface AttentionItem {
  _id: string;
  title: string;
  status: ProcedureStatus;
  department: { name: string };
  category: { name: string };
  deadline?: string;
  submittedAt?: string;
  updatedAt: string;
  createdBy?: { fullName: string; email: string } | string;
}

export interface ProceduresRequiringAttention {
  total: number;
  categories: {
    overdue: AttentionItem[];
    pendingReview: AttentionItem[];
    rejected: AttentionItem[];
    readyToPublish: AttentionItem[];
    upcomingDeadline: AttentionItem[];
  };
  procedures: AttentionItem[];
}

export interface ProcedureHealth {
  total: number;
  healthy: number;
  atRisk: number;
  critical: number;
  breakdown: {
    published: number;
    approved: number;
    pendingReview: number;
    rejected: number;
    draft: number;
    archived: number;
  };
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
  getValidator: () => apiClient.get<ValidatorDashboardStats>("/dashboard/validator").then((r) => r.data),
  getAdmin: () => apiClient.get<AdminDashboardStats>("/dashboard/admin").then((r) => r.data),
  getProceduresRequiringAttention: () => apiClient.get<ProceduresRequiringAttention>("/dashboard/attention").then((r) => r.data),
  getHealth: () => apiClient.get<ProcedureHealth>("/dashboard/health").then((r) => r.data),
};
