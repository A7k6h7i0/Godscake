import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import bakeryRoutes from "./routes/bakeryRoutes.js";
import cakeRoutes from "./routes/cakeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow non-browser clients (no Origin header), then strictly validate browser origins.
      if (!requestOrigin) return callback(null, true);
      const normalizedOrigin = requestOrigin.replace(/\/+$/, "");
      if (env.allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ message: "God's Cake API healthy" }));

app.use("/api", authRoutes);
app.use("/api/bakeries", bakeryRoutes);
app.use("/api", cakeRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
