import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../api/documents.api";

export function useProcedureDocuments(procedureId: string | undefined) {
  return useQuery({
    queryKey: ["documents", procedureId],
    queryFn: () => documentsApi.listByProcedure(procedureId as string),
    enabled: Boolean(procedureId),
  });
}

export function useUploadDocument(procedureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentsApi.upload(procedureId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", procedureId] }),
  });
}

export function useDeleteDocument(procedureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", procedureId] }),
  });
}
