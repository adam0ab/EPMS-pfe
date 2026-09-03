import { StudentRecommendationsDTO } from "@epms/shared";
import { apiClient } from "./client";

export const recommendationsApi = {
  mine: () => apiClient.get<StudentRecommendationsDTO>("/recommendations/me").then((response) => response.data),
};
