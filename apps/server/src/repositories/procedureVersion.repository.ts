import { ProcedureVersionDocument, ProcedureVersionModel } from "../models/ProcedureVersion.model";
import { BaseRepository } from "./base.repository";
export class ProcedureVersionRepository extends BaseRepository<ProcedureVersionDocument> { constructor(){ super(ProcedureVersionModel); } list(id:string){ return this.model.find({procedureId:id}).populate("createdBy","fullName email role").sort({createdAt:-1}); } detail(id:string, versionId:string){ return this.model.findOne({_id:versionId,procedureId:id}).populate("createdBy","fullName email role").populate("department","name").populate("category","name group"); } latest(id:string){ return this.model.findOne({procedureId:id}).sort({createdAt:-1}); } }
export const procedureVersionRepository = new ProcedureVersionRepository();
