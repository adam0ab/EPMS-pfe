import { Router } from "express";
import { Role } from "@epms/shared";
import { procedureController } from "../controllers/procedure.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const procedureRouter = Router();

procedureRouter.use(authenticate);

procedureRouter.get("/", procedureController.list);
procedureRouter.get("/:id", procedureController.getById);
procedureRouter.get("/:id/recommendations", procedureController.recommendations);
procedureRouter.get("/:id/validation-history", requireRole(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.VALIDATOR), procedureController.validationHistory);
procedureRouter.get("/:id/versions", requireRole(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.VALIDATOR), procedureController.versions);
procedureRouter.get("/:id/versions/compare/:versionA/:versionB", requireRole(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.VALIDATOR), procedureController.compareVersions);
procedureRouter.get("/:id/versions/:versionId", requireRole(Role.SUPER_ADMIN, Role.EMPLOYEE, Role.VALIDATOR), procedureController.versionDetail);
procedureRouter.post("/", requireRole(Role.SUPER_ADMIN), procedureController.create);
procedureRouter.patch("/:id", requireRole(Role.SUPER_ADMIN), procedureController.update);
procedureRouter.post("/:id/revision", requireRole(Role.SUPER_ADMIN), procedureController.createRevision);
procedureRouter.post("/:id/submit-review", requireRole(Role.SUPER_ADMIN), procedureController.submitForReview);
procedureRouter.post("/:id/approve", requireRole(Role.VALIDATOR), procedureController.approve);
procedureRouter.post("/:id/reject", requireRole(Role.VALIDATOR), procedureController.reject);
procedureRouter.post("/:id/publish", requireRole(Role.SUPER_ADMIN), procedureController.publish);
procedureRouter.post("/:id/archive", requireRole(Role.SUPER_ADMIN), procedureController.archive);
procedureRouter.post("/:id/versions/:versionId/restore", requireRole(Role.SUPER_ADMIN), procedureController.restoreVersion);
procedureRouter.delete("/:id", requireRole(Role.SUPER_ADMIN), procedureController.remove);
