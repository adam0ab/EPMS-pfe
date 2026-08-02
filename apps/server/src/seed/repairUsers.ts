import { connectDatabase, disconnectDatabase } from "../config/db";
import { seedUsers } from "./users.seed";

async function run() {
  await connectDatabase();
  await seedUsers();
  await disconnectDatabase();
  console.log("[seed] standard user accounts repaired");
}

run().catch((error) => {
  console.error("[seed] user repair failed", error);
  process.exit(1);
});
