import { Router, Request, Response } from "express";
import { sendWhatsAppMessage } from "../services/whatsapp.service";

const router = Router();

/**
 * =================================================
 * 🔔 META WEBHOOK VERIFICATION (GET)
 * =================================================
 */
router.get("/webhook", (req: Request, res: Response) => {
  
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // MUST come from .env

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🔔 Webhook verification hit");
  console.log("MODE :", mode);
  console.log("TOKEN FROM META:", token);
  console.log("TOKEN FROM ENV :", VERIFY_TOKEN);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(challenge);
  }

  console.error("❌ Webhook verification failed");
  return res.status(403).send("Forbidden");
});

/**
 * =================================================
 * 📩 INCOMING WHATSAPP MESSAGES (POST)
 * =================================================
 */
// 📩 INCOMING WHATSAPP MESSAGES (POST)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.log("🔥 INBOUND MESSAGE RECEIVED 🔥");
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

    // ✅ USE TEXT (NOT TEMPLATE)
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

export default router;
