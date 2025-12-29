import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import webhookRouter from "./routes/webhook.js";

dotenv.config();

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
// Capture raw body for HMAC verification and still parse JSON
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/webhook/dth", webhookRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err); // Basic logging
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  // Keep connections warm for lower latency
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
