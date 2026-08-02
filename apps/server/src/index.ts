import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { createApp } from "./app";

async function main() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`[server] EPMS API listening on port ${env.port}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.info(`[server] ${signal} received, shutting down gracefully`);

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await disconnectDatabase();
    console.info("[server] Shutdown complete");
  };

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      shutdown(signal)
        .then(() => process.exit(0))
        .catch((error) => {
          console.error("[server] Graceful shutdown failed", error);
          process.exit(1);
        });
    });
  }
}

main().catch((err) => {
  console.error(`[server] Failed to start: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
