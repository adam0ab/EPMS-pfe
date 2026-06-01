import { apiClient } from "./client";

export type ReportType = "by-department" | "by-category" | "most-viewed" | "monthly-activity";
export type ReportFormat = "pdf" | "excel";

export const reportsApi = {
  async download(type: ReportType, format: ReportFormat) {
    const response = await apiClient.get(`/reports/${type}/${format}`, { responseType: "blob" });
    const ext = format === "pdf" ? "pdf" : "xlsx";
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
