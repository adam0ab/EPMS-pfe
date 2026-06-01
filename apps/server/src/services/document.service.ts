import { documentRepository } from "../repositories/document.repository";
import { getGridFsBucket } from "../config/gridfs";
import { ApiError } from "../utils/ApiError";

export interface UploadFileInput {
  procedureId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  uploadedBy: string;
}

export const documentService = {
  listByProcedure(procedureId: string) {
    return documentRepository.findByProcedure(procedureId);
  },

  async upload({ procedureId, fileName, mimeType, buffer, uploadedBy }: UploadFileInput) {
    const bucket = getGridFsBucket();

    const gridFsId: string = await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(fileName, { contentType: mimeType });
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
      uploadStream.end(buffer);
    });

    return documentRepository.create({
      procedure: procedureId,
      fileName,
      mimeType,
      sizeBytes: buffer.length,
      gridFsId,
      uploadedBy,
    } as never);
  },

  async getDownloadStream(documentId: string) {
    const document = await documentRepository.findById(documentId);
    if (!document || !document.gridFsId) throw ApiError.notFound("Document not found");

    const bucket = getGridFsBucket();
    return { stream: bucket.openDownloadStream(document.gridFsId), document };
  },

  async remove(documentId: string) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw ApiError.notFound("Document not found");

    if (document.gridFsId) {
      const bucket = getGridFsBucket();
      await bucket.delete(document.gridFsId).catch(() => undefined);
    }

    await documentRepository.deleteById(documentId);
  },
};
