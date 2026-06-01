import { env } from "./config/env";
import { connectDatabase } from "./config/db";
import { createApp } from "./app";

async function main() {
  await connectDatabase();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`[server] EPMS API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error("[server] Failed to start", err);
  process.exit(1);
});
