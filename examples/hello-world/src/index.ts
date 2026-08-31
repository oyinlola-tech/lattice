import { createLogger } from "@lattice/logger";
import { createServer } from "node:http";

const logger = createLogger({ name: "hello-world", level: "info" });

const server = createServer((req, res) => {
  logger.info("Received request", {
    method: req.method,
    url: req.url,
  });

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!");
});

server.listen(3000, "0.0.0.0", () => {
  logger.info("Server started", { address: "http://localhost:3000" });
});

process.on("SIGINT", async () => {
  logger.info("Shutting down...");
  server.close();
  logger.info("Server stopped");
  process.exit(0);
});
