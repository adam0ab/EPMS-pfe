import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: dashboardApi.getStats });
}

export function useValidatorDashboard() {
  return useQuery({ queryKey: ["dashboard-validator"], queryFn: dashboardApi.getValidator });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: ["dashboard-admin"], queryFn: dashboardApi.getAdmin });
}

export function useProceduresRequiringAttention() {
  return useQuery({ queryKey: ["dashboard-attention"], queryFn: dashboardApi.getProceduresRequiringAttention });
}

export function useHealth() {
  return useQuery({ queryKey: ["dashboard-health"], queryFn: dashboardApi.getHealth });
}
