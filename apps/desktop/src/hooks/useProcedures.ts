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

export function useCreateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcedurePayload) => proceduresApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procedures"] }),
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proceduresApi.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procedures"] }),
  });
}

export function useArchiveProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proceduresApi.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procedures"] }),
  });
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proceduresApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procedures"] }),
  });
}
