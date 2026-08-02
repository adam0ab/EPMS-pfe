import { ProcedureStatus } from "@epms/shared";
import { ApiError } from "../utils/ApiError";

const transitions: Readonly<Record<ProcedureStatus, readonly ProcedureStatus[]>> = {
  [ProcedureStatus.DRAFT]: [ProcedureStatus.PENDING_REVIEW],
  [ProcedureStatus.PENDING_REVIEW]: [ProcedureStatus.APPROVED, ProcedureStatus.REJECTED],
  [ProcedureStatus.APPROVED]: [ProcedureStatus.PUBLISHED],
  [ProcedureStatus.REJECTED]: [ProcedureStatus.DRAFT],
  [ProcedureStatus.PUBLISHED]: [ProcedureStatus.ARCHIVED],
  [ProcedureStatus.ARCHIVED]: [],
};

export function assertWorkflowTransition(from: ProcedureStatus, to: ProcedureStatus): void {
  if (!transitions[from].includes(to)) {
    throw ApiError.conflict(`Invalid workflow transition: ${from} to ${to}`);
  }
}
