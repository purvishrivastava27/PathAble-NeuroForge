import app from "./app";
import { logger } from "./lib/logger";

// ✅ Default PORT (no crash if env missing)
const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// ✅ Start server
const server = app.listen(port, () => {
  logger.info(
    { port },
    `🚀 Server running at http://localhost:${port}`
  );
});

// ✅ Handle server errors
server.on("error", (err: any) => {
  logger.error({ err }, "❌ Server error");

  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${port} is already in use`);
  }

  process.exit(1);
});
