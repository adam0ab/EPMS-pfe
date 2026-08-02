import { connectDatabase, disconnectDatabase } from "../config/db";
import { seedDepartments } from "./departments.seed";
import { seedCategories } from "./categories.seed";
import { seedDemoData } from "./demo.seed";
import { seedUsers } from "./users.seed";

async function run() {
  await connectDatabase();
  await seedDepartments();
  await seedCategories();
  await seedDemoData();
  // The demo seed removes legacy accounts before rebuilding its own data.
  // Recreate the documented Admin/Employee/Student/Validator accounts last.
  await seedUsers();
  await disconnectDatabase();
  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
