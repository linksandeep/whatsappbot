import dotenv from "dotenv";
dotenv.config();




console.log("🔍 ENV CHECK:");
console.log("PORT =", process.env.PORT);
console.log(
  "WHATSAPP_TOKEN =",
  process.env.WHATSAPP_TOKEN
    ? process.env.WHATSAPP_TOKEN.slice(0, 10) + "..."
    : "❌ UNDEFINED"
);
console.log(
  "PHONE_NUMBER_ID =",
  process.env.WHATSAPP_PHONE_NUMBER_ID || "❌ UNDEFINED"
);

import app from "./app";
import { connectDB } from "./config/db";
const PORT = process.env.PORT || 4000;


app.post("/debug", (req, res) => {
  console.log("🔥🔥 DEBUG ENDPOINT HIT 🔥🔥");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  res.json({ ok: true });
});


const start = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server start error:", err);
  }
};

start();
// import app from "./app";

// const PORT = 4000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 SERVER LISTENING ON http://localhost:${PORT}`);
// });
