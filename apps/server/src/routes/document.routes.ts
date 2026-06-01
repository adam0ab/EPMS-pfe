import { Router } from "express";
import { Role } from "@epms/shared";
import { documentController } from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

export const documentRouter = Router();

documentRouter.use(authenticate);

documentRouter.get("/procedure/:procedureId", documentController.listByProcedure);
documentRouter.post(
  "/procedure/:procedureId",
  requireRole(Role.SUPER_ADMIN),
  uploadMiddleware.single("file"),
  documentController.upload
);
documentRouter.get("/:id/download", documentController.download);
documentRouter.delete("/:id", requireRole(Role.SUPER_ADMIN), documentController.remove);
