import app from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const start = async () => {
  try {
    await connectDb();
    app.listen(env.port, () => logger.info(`Server running on http://localhost:${env.port}`));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
