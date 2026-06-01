import { ChangeEvent, useRef } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { documentsApi } from "../../api/documents.api";
import { useDeleteDocument, useProcedureDocuments, useUploadDocument } from "../../hooks/useDocuments";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsCard({ procedureId, isAdmin }: { procedureId: string; isAdmin: boolean }) {
  const { data: documents, isLoading } = useProcedureDocuments(procedureId);
  const uploadDocument = useUploadDocument(procedureId);
  const deleteDocument = useDeleteDocument(procedureId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadDocument.mutate(file);
    e.target.value = "";
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary dark:text-white">Attachments</h2>
        {isAdmin && (
          <>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" />
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadDocument.isPending}>
              {uploadDocument.isPending ? "Uploading…" : "+ Upload"}
            </Button>
          </>
        )}
      </div>

      <ul className="space-y-2 text-sm">
        {isLoading && <p className="text-slate-400">Loading…</p>}
        {!isLoading && (documents ?? []).length === 0 && <p className="text-slate-400">No files uploaded.</p>}
        {documents?.map((doc) => (
          <li
            key={doc._id}
            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-surface-dark-border"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-secondary dark:text-white">{doc.fileName}</p>
              <p className="text-xs text-slate-400">{formatBytes(doc.sizeBytes)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="sm" onClick={() => documentsApi.download(doc._id, doc.fileName)}>
                Download
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() => {
                    if (confirm(`Delete "${doc.fileName}"?`)) deleteDocument.mutate(doc._id);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {uploadDocument.isError && (
        <p className="mt-2 text-xs text-danger">Upload failed. Allowed: PDF, DOCX, XLSX, images (max 20MB).</p>
      )}
    </Card>
  );
}
