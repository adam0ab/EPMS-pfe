import { DocumentMetaDocument, DocumentMetaModel } from "../models/Document.model";
import { BaseRepository } from "./base.repository";

export class DocumentRepository extends BaseRepository<DocumentMetaDocument> {
  constructor() {
    super(DocumentMetaModel);
  }

  findByProcedure(procedureId: string) {
    return this.model.find({ procedure: procedureId }).sort({ createdAt: -1 });
  }
}

export const documentRepository = new DocumentRepository();
