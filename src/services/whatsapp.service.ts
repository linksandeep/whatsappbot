import axios from "axios";

export const sendWhatsAppMessage = async (to: string, message: string) => {
  console.log("\n📤 sendWhatsAppMessage called");
  console.log("➡️ To:", to);

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token) throw new Error("WHATSAPP_TOKEN missing");
  if (!phoneId) throw new Error("WHATSAPP_PHONE_NUMBER_ID missing");

  const url = `https://graph.facebook.com/v24.0/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: String(to),
    type: "text",
    text: {
      body: message
    }
  };

  console.log("🌐 Request URL:", url);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  console.log("✅ Bot TEXT reply sent:", response.data);
  return response.data;
};


// export const sendWhatsAppTemplate = async (to: string) => {
//   console.log("\n📤 sendWhatsAppTemplate called");
//   console.log("➡️ To:", to);

//   const token = process.env.WHATSAPP_TOKEN!;
//   const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;

//   const url = `https://graph.facebook.com/v24.0/${phoneId}/messages`;

//   const payload = {
//     messaging_product: "whatsapp",
//     to: String(to),
//     type: "template",
//     template: {
//       name: "hello_world",
//       language: { code: "en_US" }
//     }
//   };

//   console.log("🌐 Request URL:", url);
//   console.log("📦 Payload:", JSON.stringify(payload, null, 2));

//   const response = await axios.post(url, payload, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json"
//     }
//   });

//   console.log("✅ Template message sent:", response.data);
//   return response.data;
// };
