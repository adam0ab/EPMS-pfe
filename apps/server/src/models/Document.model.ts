import { Schema, model, Types } from "mongoose";

// Phase 2 will populate gridFsId by streaming uploads into MongoDB GridFS.
// The schema is defined now so Procedure documents can already reference it.
export interface DocumentMetaDocument {
  _id: Types.ObjectId;
  procedure: Types.ObjectId;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  gridFsId?: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentMetaDocument>(
  {
    procedure: { type: Schema.Types.ObjectId, ref: "Procedure", required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    gridFsId: { type: Schema.Types.ObjectId },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const DocumentMetaModel = model<DocumentMetaDocument>("DocumentMeta", documentSchema);
