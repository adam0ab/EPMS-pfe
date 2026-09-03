import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProcedureFilters, ProcedurePayload, proceduresApi } from "../api/procedures.api";

export function useProcedures(filters: ProcedureFilters) {
  return useQuery({
    queryKey: ["procedures", filters],
    queryFn: () => proceduresApi.list(filters),
  });
}

export function useProcedure(id: string | undefined) {
  return useQuery({
    queryKey: ["procedure", id],
    queryFn: () => proceduresApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useValidationHistory(id: string | undefined) {
  return useQuery({
    queryKey: ["procedure-validation-history", id],
    queryFn: () => proceduresApi.validationHistory(id as string),
    enabled: Boolean(id),
  });
}
export function useProcedureVersions(id: string | undefined) { return useQuery({ queryKey:["procedure-versions",id], queryFn:()=>proceduresApi.versions(id as string), enabled:Boolean(id) }); }

export function useProcedureRecommendations(id: string | undefined) {
  return useQuery({ queryKey: ["procedure-recommendations", id], queryFn: () => proceduresApi.recommendations(id as string), enabled: Boolean(id) });
}

export function useCreateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcedurePayload) => proceduresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-validator"] });
    },
  });
}

export function useCreateRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proceduresApi.createRevision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-validator"] });
    },
  });
}

export function useUpdateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProcedurePayload> }) =>
      proceduresApi.update(id, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      queryClient.invalidateQueries({ queryKey: ["procedure", vars.id] });
    },
  });
}

export function usePublishProcedure() {
  return useWorkflowMutation((id: string) => proceduresApi.publish(id));
}

export function useSubmitForReview() {
  return useWorkflowMutation(({ id, comment }: { id: string; comment?: string }) => proceduresApi.submitForReview(id, comment));
}

export function useApproveProcedure() {
  return useWorkflowMutation(({ id, comment }: { id: string; comment?: string }) => proceduresApi.approve(id, comment));
}

export function useRejectProcedure() {
  return useWorkflowMutation(({ id, comment }: { id: string; comment: string }) => proceduresApi.reject(id, comment));
}

function useWorkflowMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      queryClient.invalidateQueries({ queryKey: ["procedure"] });
      queryClient.invalidateQueries({ queryKey: ["procedure-validation-history"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useArchiveProcedure() {
  return useWorkflowMutation((id: string) => proceduresApi.archive(id));
}

export function useRestoreProcedureVersion() {
  return useWorkflowMutation(({ id, versionId }: { id: string; versionId: string }) => proceduresApi.restoreVersion(id, versionId));
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proceduresApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procedures"] }),
  });
}
