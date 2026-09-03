import { useQuery } from "@tanstack/react-query";
import { Role } from "@epms/shared";
import { recommendationsApi } from "../api/recommendations.api";
import { useAuthStore } from "../store/auth.store";

export function useStudentRecommendations() {
  const role = useAuthStore((state) => state.user?.role);
  return useQuery({
    queryKey: ["student-recommendations"],
    queryFn: recommendationsApi.mine,
    enabled: role === Role.STUDENT,
  });
}
