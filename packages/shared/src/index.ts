// Shared types and constants used by both the @epms/server backend and the
// @epms/desktop Electron/React frontend. Keeping these in one package avoids
// the two apps drifting out of sync on roles, statuses, and seed data.

export enum Role {
  SUPER_ADMIN = "super_admin",
  EMPLOYEE = "employee",
  STUDENT = "student",
  VALIDATOR = "validator",
}

export enum ProcedureStatus {
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum ProcedureAudience {
  STUDENT = "STUDENT",
  EMPLOYEE = "EMPLOYEE",
}

export enum NotificationType {
  PROCEDURE_SUBMITTED_FOR_REVIEW = "procedure_submitted_for_review",
  PROCEDURE_APPROVED = "procedure_approved",
  PROCEDURE_REJECTED = "procedure_rejected",
  PROCEDURE_PUBLISHED = "procedure_published",
  PROCEDURE_UPDATED = "procedure_updated",
  PROCEDURE_ARCHIVED = "procedure_archived",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  PUBLISH = "publish",
  ARCHIVE = "archive",
  LOGIN = "login",
  DOWNLOAD = "download",
  SUBMIT_REVIEW = "submit_review",
  APPROVE = "approve",
  REJECT = "reject",
  VERSION_CREATED = "version_created",
  VERSION_RESTORED = "version_restored",
  VERSION_COMPARED = "version_compared",
  VERSION_VIEWED = "version_viewed",
}

export enum ChangeType { MINOR = "minor", MAJOR = "major" }

export enum ValidationAction {
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  RETURNED_TO_DRAFT = "returned_to_draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export const DEPARTMENTS = [
  "Academic Affairs",
  "Administration",
  "Finance",
  "Human Resources",
  "Student Affairs",
  "Research",
  "International Relations",
  "IT Department",
  "Quality Assurance",
  "Logistics",
  "Purchasing",
  "Procurement",
  "Facilities Management",
  "Security",
  "Library",
  "Internship Office",
  "Career Center",
  "Examination Department",
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];

export const CATEGORY_GROUPS: Record<string, string[]> = {
  "Academic Procedures": [
    "Student Enrollment",
    "Annual Registration",
    "Re-registration",
    "Academic Withdrawal",
    "Academic Suspension",
    "Transfer Request",
    "Major Change",
    "Semester Validation",
    "Graduation Process",
    "Internship Validation",
    "PFE Validation",
    "Academic Appeal",
    "Grade Appeal",
    "Retake Exams",
    "Scholarship Request",
  ],
  "Examination Procedures": [
    "Exam Planning",
    "Invigilator Assignment",
    "Attendance Control",
    "Exam Incident Reporting",
    "Grade Submission",
    "Grade Validation",
    "Result Publication",
    "Exam Archiving",
  ],
  "Fraud Management Procedures": [
    "Fraud Reporting",
    "Investigation Process",
    "Student Hearing",
    "Disciplinary Committee",
    "Sanction Assignment",
    "Appeal Procedure",
    "Case Closure",
  ],
  "Administrative Procedures": [
    "Certificate Request",
    "Transcript Request",
    "Student Card Request",
    "Administrative Complaint",
    "Official Document Request",
    "Archive Consultation",
  ],
  "Financial Procedures": [
    "Tuition Payment",
    "Installment Plan",
    "Refund Request",
    "Scholarship Management",
    "Financial Appeal",
    "Payment Verification",
    "Debt Recovery",
  ],
  "Human Resources Procedures": [
    "Employee Recruitment",
    "Onboarding",
    "Leave Request",
    "Performance Evaluation",
    "Promotion Request",
    "Training Request",
    "Resignation Procedure",
  ],
  "Logistics Procedures": [
    "Equipment Request",
    "Classroom Reservation",
    "Vehicle Reservation",
    "Maintenance Request",
    "IT Equipment Request",
    "Asset Tracking",
    "Inventory Control",
    "Warehouse Management",
  ],
  "Facility Management Procedures": [
    "Building Access",
    "Office Allocation",
    "Infrastructure Maintenance",
    "Safety Inspection",
    "Emergency Management",
  ],
  "Supplier Management Procedures": [
    "Supplier Registration",
    "Supplier Qualification",
    "Supplier Evaluation",
    "Purchase Request",
    "Purchase Approval",
    "Purchase Order Creation",
    "Goods Reception",
    "Invoice Validation",
    "Supplier Payment",
    "Contract Renewal",
    "Contract Termination",
  ],
  "IT Procedures": [
    "User Account Creation",
    "Password Reset",
    "Software Request",
    "Hardware Request",
    "Access Management",
    "Security Incident Reporting",
    "Backup Procedures",
  ],
  "Quality Procedures": [
    "Internal Audit",
    "Corrective Action",
    "Preventive Action",
    "Accreditation Process",
    "Compliance Review",
    "Satisfaction Surveys",
  ],
};

export interface ProcedureStep {
  order: number;
  description: string;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
}

export interface UserDTO {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentDTO {
  _id: string;
  name: string;
  description?: string;
  procedureCount?: number;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  group: string;
}

export interface ProcedureDTO {
  _id: string;
  title: string;
  description: string;
  department: DepartmentDTO | string;
  category: CategoryDTO | string;
  keywords: string[];
  requiredDocuments: string[];
  steps: ProcedureStep[];
  responsiblePerson: string;
  effectiveDate: string;
  lastUpdate: string;
  versionNumber: string;
  status: ProcedureStatus;
  targetAudience: ProcedureAudience[];
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  showInCalendar?: boolean;
  eventType?: string;
  lastValidationComment?: string;
  viewCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecommendationType = "TOP_RECOMMENDATION" | "CONTINUE" | "DEADLINE_APPROACHING" | "RELATED_TO_CHECKLIST" | "EXPLORE";
export type RecommendationAction = "CONTINUE" | "START";
export type RecommendationPriority = "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW";

export interface StudentRecommendationDTO {
  procedure: ProcedureDTO;
  type: RecommendationType;
  priority: RecommendationPriority;
  reasons: string[];
  checklist?: {
    completedCount: number;
    totalCount: number;
    progressPercent: number;
    isComplete: boolean;
  };
}

export interface StudentRecommendationsDTO {
  nextBestAction?: StudentRecommendationDTO & { action: RecommendationAction };
  sections: {
    recommendedForYou: StudentRecommendationDTO[];
    deadlineApproaching: StudentRecommendationDTO[];
    continue: StudentRecommendationDTO[];
    relatedToChecklist: StudentRecommendationDTO[];
    explore: StudentRecommendationDTO[];
  };
}

export interface ProcedureVersionDTO {
  _id: string; procedureId: string; versionNumber: string; title: string; description: string;
  department: DepartmentDTO | string; category: CategoryDTO | string; steps: ProcedureStep[];
  keywords: string[]; requiredDocuments: string[]; status: ProcedureStatus; createdBy: UserDTO | string;
  changeType: ChangeType; changeDescription: string; createdAt: string;
}

export interface ValidationHistoryDTO {
  _id: string;
  procedureId: string;
  action: ValidationAction;
  actor: { _id: string; fullName: string; email: string; role: Role } | string;
  comment?: string;
  createdAt: string;
}

export interface DocumentMetaDTO {
  _id: string;
  procedure: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy?: string;
  createdAt: string;
}

export interface NotificationDTO {
  _id: string;
  type: NotificationType;
  message: string;
  procedure?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorBody {
  message: string;
  details?: unknown;
}
