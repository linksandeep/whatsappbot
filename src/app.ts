import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// ✅ IMPORT UPLOAD ROUTES
import uploadRoutes from "./routes/upload.routes";
import { sendWhatsAppMessage } from "./services/whatsapp.service";

const app = express();

/* ===== GLOBAL LOGGING (VERY IMPORTANT) ===== */
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("➡️ INCOMING:", req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

/* ===== ROOT TEST ===== */
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Backend running" });
});

/* ===== WEBHOOK VERIFY (GET) ===== */
const VERIFY_TOKEN = "sandeep"; // MUST MATCH META EXACTLY

app.get("/webhook", (req: Request, res: Response) => {
  console.log("🔔 META VERIFICATION HIT");
  console.log("QUERY:", req.query);

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("❌ VERIFICATION FAILED");
  return res.sendStatus(403);
});

/* ===== WEBHOOK EVENTS (POST) ===== */
app.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.log("🔥 INBOUND MESSAGE RECEIVED 🔥");
    console.log(JSON.stringify(req.body, null, 2));

    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || !message.text?.body) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text.body;

    console.log("👤 From:", from);
    console.log("💬 Text:", text);

    await sendWhatsAppMessage(
      from,
      `Hi 👋 Thanks for messaging us!\nJoin our community 👉 ${process.env.COMMUNITY_LINK}`
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.sendStatus(200);
  }
});


/* =================================================
   📤 UPLOAD ROUTES (ADDED BACK)
   Base URL: http://localhost:4000/api/upload
================================================= */
app.use("/api/upload", uploadRoutes);

/* ===== OPTIONAL ERROR HANDLER ===== */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
