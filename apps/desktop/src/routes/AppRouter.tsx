import { Navigate, Route, Routes } from "react-router-dom";
import { Role } from "@epms/shared";
import { ProtectedRoute, RequireRole } from "./ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProcedureList from "../pages/Procedures/ProcedureList";
import ProcedureDetail from "../pages/Procedures/ProcedureDetail";
import DepartmentList from "../pages/Departments/DepartmentList";
import CategoryList from "../pages/Categories/CategoryList";
import UserList from "../pages/Users/UserList";
import ReportsPage from "../pages/Reports/ReportsPage";
import ProcedureViewerPage from "../pages/Procedures/ProcedureViewerPage";
import AssistantIA from "../pages/AssistantIA";
import Recommendations from "../pages/Recommendations";
import Notifications from "../pages/Notifications";
import ProcedureCalendar from "../pages/ProcedureCalendar";
import MyChecklist from "../pages/MyChecklist";
import FeedbackQuality from "../pages/FeedbackQuality";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/calendar" element={<ProcedureCalendar />} />
          <Route path="/procedures" element={<ProcedureList />} />
          <Route element={<RequireRole roles={[Role.STUDENT]} />}><Route path="/my-checklist" element={<MyChecklist />} /></Route>
          <Route element={<RequireRole roles={[Role.EMPLOYEE, Role.STUDENT]} />}><Route path="/procedures/assistant" element={<AssistantIA />} /></Route>
          <Route element={<RequireRole roles={[Role.EMPLOYEE, Role.STUDENT]} />}><Route path="/recommendations" element={<Recommendations />} /></Route>
           <Route path="/procedures/:id/workflow" element={<ProcedureViewerPage />} />
           <Route path="/procedures/:id" element={<ProcedureDetail />} />

          <Route element={<RequireRole roles={[Role.SUPER_ADMIN]} />}>
            <Route path="/feedback-quality" element={<FeedbackQuality />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
