import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { departmentRouter } from "./department.routes";
import { categoryRouter } from "./category.routes";
import { procedureRouter } from "./procedure.routes";
import { dashboardRouter } from "./dashboard.routes";
import { aiRouter } from "./ai.routes";
import { documentRouter } from "./document.routes";
import { notificationRouter } from "./notification.routes";
import { reportRouter } from "./report.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/departments", departmentRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/procedures", procedureRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/documents", documentRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/reports", reportRouter);
