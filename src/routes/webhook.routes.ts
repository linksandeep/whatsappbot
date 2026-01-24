import { Router, Request, Response } from "express";
import { Lead } from "../models/Lead";
import { fetchLeadDetails, sendTemplateMessage, sendWhatsAppMessage } from "../services/whatsapp.service";

const router = Router();

/**
 * =====================================
 * META WEBHOOK VERIFICATION (GET)
 * =====================================
 * This handles the initial handshake when you click 'Verify' in Meta.
 */
router.get("/webhook", (req: Request, res: Response) => {
  console.log("🔵 [WEBHOOK VERIFY] Request received from Meta");
  
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Comparison with your .env variable
  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅ [WEBHOOK VERIFY] Token verified successfully");
    return res.status(200).send(challenge);
  }

  console.error("❌ [WEBHOOK VERIFY] Verification failed. Tokens do not match.");
  res.sendStatus(403);
});

/**
 * =====================================
 * META WEBHOOK EXECUTION (POST)
 * =====================================
 * This handles incoming messages and lead form submissions.
 */
router.post("/webhook", async (req: Request, res: Response) => {
  console.log("🟢 [WEBHOOK HIT] Incoming Meta Webhook Event");
  
  try {
    // Log the full body for deep debugging
    // console.log("Full Payload:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];

    if (!change) {
      console.log("⚠️ No changes object found in payload.");
      return res.sendStatus(200);
    }

    const field = change.field;
    const value = change.value;

    console.log(`📌 Detected Field Type: ${field}`);

    /**
     * 1️⃣ HANDLE DIRECT WHATSAPP MESSAGES
     */
    if (field === "messages") {
      const message = value?.messages?.[0];
      
      if (!message) {
        console.log("ℹ️ Webhook hit for 'messages' but no message object found (Status/Read update).");
        return res.sendStatus(200);
      }

      const from = message.from;
      const text = message.text?.body;
      const contactName = value?.contacts?.[0]?.profile?.name || "Customer";

      console.log(`📩 Message Received | From: ${contactName} (${from}) | Text: "${text}"`);

      // Attempt to send the reply
      try {
        console.log(`📤 Triggering auto-reply to ${from}...`);
        await sendWhatsAppMessage(from, `Hi ${contactName}! Bot received your message: ${text}`);
        console.log(`🎉 SUCCESS: Manual reply sent to ${from}`);
      } catch (sendError: any) {
        console.error(`❌ FAILED to send message to ${from}:`, sendError.message);
      }
    }

    /**
     * 2️⃣ HANDLE LEADGEN EVENTS (Meta Lead Forms)
     */
    else if (field === "leadgen") {
      console.log("📊 [LEADGEN] Processing new Lead Form submission...");
      
      const leadId = value?.leadgen_id;
      if (!leadId) {
        console.error("❌ Lead ID missing from leadgen event.");
        return res.sendStatus(200);
      }

      // Check for duplicate to avoid double-messaging
      const existingLead = await Lead.findOne({ leadId });
      if (existingLead) {
        console.log(`⚠️ Duplicate lead ignored: ${leadId}`);
        return res.sendStatus(200);
      }

      console.log(`📡 Fetching data for Lead ID: ${leadId}`);
      const leadInfo = await fetchLeadDetails(leadId);

      // Extract Name and Phone
      const name = leadInfo.field_data?.find((f: any) => f.name === "full_name")?.values?.[0] || "Customer";
      const phone = leadInfo.field_data?.find((f: any) => f.name === "phone_number")?.values?.[0];

      if (!phone) {
        console.error("❌ Phone number not found in lead data.");
        return res.sendStatus(200);
      }

      console.log(`👤 New Lead Identified: ${name} (${phone})`);

      // Save to MongoDB
      await Lead.create({ name, phone, leadId, status: "AUTO_SENT" });
      console.log("💾 Lead saved to MongoDB.");

      // Send the Template Message
      try {
        await sendTemplateMessage(phone, name);
        console.log(`🎉 SUCCESS: Template message sent to Lead: ${name}`);
      } catch (templateError: any) {
        console.error("❌ FAILED to send template message:", templateError.message);
      }
    }

    // Always return 200 within 4 seconds to Meta
    res.sendStatus(200);
    
  } catch (error: any) {
    console.error("🔥 CRITICAL WEBHOOK ERROR:");
    console.error("Message:", error.message);
    if (error.stack) console.error("Stack:", error.stack);

    // Still return 200 so Meta doesn't disable your webhook for retrying failures
    res.sendStatus(200);
  }
});

export default router;



// import { Router, Request, Response } from "express";
// import { sendWhatsAppMessage } from "../services/whatsapp.service";

// const router = Router();

// /**
//  * =================================================
//  * 🔔 META WEBHOOK VERIFICATION (GET)
//  * =================================================
//  */
// router.get("/webhook", (req: Request, res: Response) => {
  
//   const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // MUST come from .env

//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   console.log("🔔 Webhook verification hit");
//   console.log("MODE :", mode);
//   console.log("TOKEN FROM META:", token);
//   console.log("TOKEN FROM ENV :", VERIFY_TOKEN);

//   if (mode === "subscribe" && token === VERIFY_TOKEN) {
//     console.log("✅ Webhook verified");
//     res.setHeader("Content-Type", "text/plain");
//     return res.status(200).send(challenge);
//   }

//   console.error("❌ Webhook verification failed");
//   return res.status(403).send("Forbidden");
// });

// /**
//  * =================================================
//  * 📩 INCOMING WHATSAPP MESSAGES (POST)
//  * =================================================
//  */
// // 📩 INCOMING WHATSAPP MESSAGES (POST)
// router.post("/webhook", async (req: Request, res: Response) => {
//   try {
//     console.log("🔥 INCOMING WEBHOOK 🔥");
//     console.log(JSON.stringify(req.body, null, 2));

//     const message =
//       req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

//     // 🛑 Ignore non-text or status messages
//     if (!message || message.from === undefined || !message.text?.body) {
//       console.log("ℹ️ Ignored non-user message");
//       return res.sendStatus(200);
//     }

//     // 🛑 Ignore messages sent by the bot itself
//     if (message?.from === req.body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id) {
//       console.log("ℹ️ Ignored bot's own message");
//       return res.sendStatus(200);
//     }

//     const from = message.from;
//     const text = message.text.body.toLowerCase();

//     console.log("👤 From:", from);
//     console.log("💬 Text:", text);

//     let reply = "";

//     if (text === "hi" || text === "hello") {
//       reply =
//         "👋 Hi! Welcome to our WhatsApp Bot.\n\n" +
//         "You can ask about:\n" +
//         "1️⃣ Course details\n" +
//         "2️⃣ Price\n" +
//         "3️⃣ Help\n\n" +
//         "Just type your question 😊";
//     }
//     else if (text.includes("price")) {
//       reply = "💰 Our course price is ₹999 with lifetime access.";
//     }
//     else if (text.includes("course")) {
//       reply = "📚 We offer WhatsApp Automation & Excel Bot training.";
//     }
//     else if (text.includes("help")) {
//       reply = "🤝 You can ask about price, course details, or offers.";
//     }
//     else {
//       reply =
//         "❓ Please ask questions related to our course only.\n" +
//         "Example: price, course, help";
//     }

//     console.log("🤖 Reply:", reply);

//     await sendWhatsAppMessage(from, reply);
//     return res.sendStatus(200);

//   } catch (err) {
//     console.error("❌ Webhook error:", err);
//     return res.sendStatus(200);
//   }
// });



// export default router;
