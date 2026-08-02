import { connectDatabase, disconnectDatabase } from "../config/db";
import { ProcedureModel } from "../models/Procedure.model";
import { ProcedureVersionModel } from "../models/ProcedureVersion.model";

async function run() {
  await connectDatabase();
  await ProcedureVersionModel.deleteMany({});
  const result = await ProcedureModel.updateMany({}, { $set: { versionNumber: "1.0" } });
  console.log(`[reset-versions] ${result.modifiedCount} procedures reset to v1.0; version history cleared`);
  await disconnectDatabase();
}
run().catch(async (error) => { console.error(error); await disconnectDatabase(); process.exit(1); });
