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
};
