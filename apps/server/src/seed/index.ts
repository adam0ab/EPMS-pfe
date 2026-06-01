import { connectDatabase, disconnectDatabase } from "../config/db";
import { seedDepartments } from "./departments.seed";
import { seedCategories } from "./categories.seed";
import { seedUsers } from "./users.seed";
import { seedProcedures } from "./procedures.seed";

async function run() {
  await connectDatabase();
  await seedDepartments();
  await seedCategories();
  await seedUsers();
  await seedProcedures();
  await disconnectDatabase();
  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
