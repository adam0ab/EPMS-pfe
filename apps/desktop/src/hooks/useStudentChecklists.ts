import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentChecklist, studentChecklistsApi } from "../api/studentChecklists.api";
import { useAuthStore } from "../store/auth.store";
import { Role } from "@epms/shared";

function useStudentOnlyQuery<T>(key: string[], queryFn: () => Promise<T>) {
  const role = useAuthStore((state) => state.user?.role);
  return useQuery({ queryKey: key, queryFn, enabled: role === Role.STUDENT });
}

export function useStudentChecklists() { return useStudentOnlyQuery(["student-checklists"], studentChecklistsApi.list); }
export function useChecklistAttention() { return useStudentOnlyQuery(["student-checklists", "attention"], studentChecklistsApi.attention); }

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  return () => {
    queryClient.invalidateQueries({ queryKey: ["student-checklists"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-student"] });
    queryClient.invalidateQueries({ queryKey: ["student-recommendations"] });
  };
}

export function useAddToChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentChecklistsApi.add,
    onSuccess: (checklist) => {
      queryClient.setQueryData<StudentChecklist[]>(["student-checklists"], (current = []) => {
        const alreadyPresent = current.some((entry) => entry.procedure._id === checklist.procedure._id);
        return alreadyPresent
          ? current.map((entry) => entry.procedure._id === checklist.procedure._id ? checklist : entry)
          : [checklist, ...current];
      });
      invalidate(queryClient)();
    },
  });
}

export function useSetChecklistStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ procedureId, stepOrder, completed }: { procedureId: string; stepOrder: number; completed: boolean }) =>
      studentChecklistsApi.setStepCompletion(procedureId, stepOrder, completed),
    onSuccess: invalidate(queryClient),
  });
}
