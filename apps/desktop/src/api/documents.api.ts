import { DocumentMetaDTO } from "@epms/shared";
import { apiClient } from "./client";

export const documentsApi = {
  listByProcedure: (procedureId: string) =>
    apiClient.get<DocumentMetaDTO[]>(`/documents/procedure/${procedureId}`).then((r) => r.data),

  upload: (procedureId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<DocumentMetaDTO>(`/documents/procedure/${procedureId}`, formData)
      .then((r) => r.data);
  },

  remove: (id: string) => apiClient.delete(`/documents/${id}`),

  async download(id: string, fileName: string) {
    const response = await apiClient.get(`/documents/${id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async view(id: string) {
    // Open synchronously while the click is still a user gesture. Opening only after
    // awaiting the API response is treated as a popup by many browsers/Electron shells.
    const previewWindow = window.open("", "_blank");
    try {
      const response = await apiClient.get(`/documents/${id}/download`, { responseType: "blob" });
      const responseContentType = response.headers["content-type"];
      const contentType = typeof responseContentType === "string" ? responseContentType : "application/pdf";
      const file = response.data instanceof Blob && response.data.type
        ? response.data
        : new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(file);

      if (previewWindow) {
        previewWindow.location.replace(url);
        previewWindow.focus();
      } else {
        // Fallback when a browser blocks the new window despite the click gesture.
        window.location.assign(url);
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      previewWindow?.close();
      throw error;
    }
  },
};
