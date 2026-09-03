import { apiClient } from "./client";

export type ReportType = "by-department" | "by-category" | "most-viewed" | "monthly-activity";
export type ReportFormat = "pdf" | "excel";
export type ReportPeriod = "7d" | "30d" | "90d" | "1y" | "all";

export interface ReportFilters {
  period: ReportPeriod;
  status?: string;
  department?: string;
  category?: string;
}

export interface ExecutiveSummary {
  totalProcedures: number;
  publishedRate: number;
  approvalRate: number;
  rejectionRate: number;
  validationBacklog: number;
  publicationBacklog: number;
  atRiskProcedures: number;
  criticalProcedures: number;
  averageValidationTimeHours: number | null;
  averagePublicationTimeHours: number | null;
}

export interface WorkflowAnalysis {
  distribution: Record<string, number>;
  submissionRate: number;
  approvalRate: number;
  rejectionRate: number;
  publicationRate: number;
  bottlenecks: Array<{ status: string; count: number; label: string; severity: string }>;
}

export interface HealthAnalysis {
  healthy: number;
  atRisk: number;
  critical: number;
  total: number;
  distribution: Record<string, number>;
  averageScore: number;
}

export interface ValidationAnalysis {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  approvalRate: number;
  rejectionRate: number;
  averageValidationTimeHours: number | null;
  fastestValidationHours: number | null;
  longestValidationHours: number | null;
  periodLabel: string;
}

export interface ComplianceAnalysis {
  total: number;
  withDocuments: number;
  withoutDocuments: number;
  withResponsiblePerson: number;
  withoutResponsiblePerson: number;
  withDeadline: number;
  withoutDeadline: number;
  documentationCoverage: number;
  metadataCompleteness: number;
}

export interface DeadlineAnalysis {
  overdue: number;
  dueSoon: number;
  upcoming: number;
  noDeadline: number;
  total: number;
  overdueRate: number;
  dueSoonRate: number;
}

export interface AgeAnalysis {
  recentlyUpdated: number;
  aging: number;
  outdated: number;
  total: number;
  recentlyUpdatedPct: number;
  agingPct: number;
  outdatedPct: number;
}

export interface Insight {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  message: string;
}

export interface Decision {
  title: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  affectedCount: number;
  suggestedAction: string;
}

export interface ExecutiveConclusion {
  overallStatus: "HEALTHY" | "STABLE" | "NEEDS_ATTENTION" | "CRITICAL";
  mainStrength: string;
  mainWeakness: string;
  mainRisk: string;
  recommendedPriority: string;
}

export interface FullReport {
  generatedAt: string;
  periodLabel: string;
  filters: ReportFilters;
  executiveSummary: ExecutiveSummary;
  workflowAnalysis: WorkflowAnalysis;
  healthAnalysis: HealthAnalysis;
  validationAnalysis: ValidationAnalysis;
  complianceAnalysis: ComplianceAnalysis;
  deadlineAnalysis: DeadlineAnalysis;
  ageAnalysis: AgeAnalysis;
  insights: Insight[];
  decisions: Decision[];
  conclusion: ExecutiveConclusion;
}

export const reportsApi = {
  generate: (filters: ReportFilters) =>
    apiClient.get<FullReport>("/reports/generate", { params: filters }).then((r) => r.data),

  downloadPdf: (filters: ReportFilters) =>
    apiClient.get("/reports/pdf", { params: filters, responseType: "blob" }).then((r) => r.data),

  downloadExcel: (filters: ReportFilters) =>
    apiClient.get("/reports/excel", { params: filters, responseType: "blob" }).then((r) => r.data),
};
