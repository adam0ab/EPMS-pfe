import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Role } from "@epms/shared";
import { procedureFeedbackApi } from "../api/procedureFeedback.api";
import { useAuthStore } from "../store/auth.store";
export function useMyProcedureFeedback(id?: string) { const role = useAuthStore((s) => s.user?.role); return useQuery({ queryKey: ["procedure-feedback", id], queryFn: () => procedureFeedbackApi.mine(id!), enabled: role === Role.STUDENT && Boolean(id) }); }
export function useSaveProcedureFeedback(id: string) { const client = useQueryClient(); return useMutation({ mutationFn: (data: { rating: number; category?: string; comment?: string }) => procedureFeedbackApi.save(id, data), onSuccess: () => client.invalidateQueries({ queryKey: ["procedure-feedback", id] }) }); }
export function useAdminFeedback() { return useQuery({ queryKey: ["admin-feedback"], queryFn: procedureFeedbackApi.list }); }
export function useAdminFeedbackSummary() { return useQuery({ queryKey: ["admin-feedback-summary"], queryFn: procedureFeedbackApi.summary }); }
export function useFeedbackStatus() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: string; status: "NEW" | "REVIEWED" | "ACTION_REQUIRED" | "RESOLVED" }) => procedureFeedbackApi.status(id, status), onSuccess: () => { client.invalidateQueries({ queryKey: ["admin-feedback"] }); client.invalidateQueries({ queryKey: ["admin-feedback-summary"] }); } }); }
