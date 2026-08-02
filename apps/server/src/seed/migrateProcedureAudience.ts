import { ProcedureAudience } from "@epms/shared";
import { connectDatabase, disconnectDatabase } from "../config/db";
import { ProcedureModel } from "../models/Procedure.model";

async function run() {
  await connectDatabase();
  const result = await ProcedureModel.updateMany(
    { $or: [{ targetAudience: { $exists: false } }, { targetAudience: { $size: 0 } }] },
    { $set: { targetAudience: [ProcedureAudience.STUDENT, ProcedureAudience.EMPLOYEE] } }
  );
  console.log(`[migration] procedure audience: matched=${result.matchedCount} modified=${result.modifiedCount}`);
  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error("[migration] procedure audience failed", error);
  await disconnectDatabase();
  process.exit(1);
});
