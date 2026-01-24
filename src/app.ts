import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload.routes";
import webhookRoutes from "./routes/webhook.routes"; // Import your router

const app = express();

app.use(cors());
app.use(express.json());

/* ===== ROOT TEST ===== */
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Backend running" });
});

/* ===== ROUTES ===== */
app.use("/api/upload", uploadRoutes);
app.use("/", webhookRoutes); // This connects your webhook router logic

/* ===== GLOBAL ERROR HANDLER ===== */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;