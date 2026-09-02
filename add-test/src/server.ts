import { createApp } from "./app.js";
import { createRuntime } from "@oyinlola141/lattice-runtime";
import { logger } from "@oyinlola141/lattice-logger";

const app = await createApp();

const runtime = createRuntime({
  onShutdown: async () => {
    await app.stop();
  },
});

await runtime.start();

const server = await app.listen();

process.on("SIGTERM", async () => {
  await runtime.stop();
  process.exit(0);
});
