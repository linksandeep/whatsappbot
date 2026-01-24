import axios from "axios";

const API_VERSION = "v24.0";
const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

// 1. Fetch details of the lead using the Lead ID from Meta
export const fetchLeadDetails = async (leadId: string) => {
  const url = `https://graph.facebook.com/${API_VERSION}/${leadId}`;
  const response = await axios.get(url, { params: { access_token: token } });
  return response.data; // Returns field_data with name/phone
};

// 2. Send the Template Message
export const sendTemplateMessage = async (to: string, name: string) => {
  const formattedTo = String(to).replace(/\D/g, "");
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: formattedTo,
    type: "template",
    template: {
      name: "community_invite", // Name of your approved template
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: name },
          { type: "text", text: process.env.COMMUNITY_LINK }
        ]
      }]
    }
  };

  return axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


export const sendWhatsAppMessage = async (to: string, text: string) => {
  try {
    // Use the exact names from your .env
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID; 
    const token = process.env.WHATSAPP_TOKEN;
    const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
    
    const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to, // Ensure this includes the country code, e.g., 919555...
      type: "text",
      text: { body: text }
    };

    const response = await axios.post(url, payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Meta API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ META API ERROR Detail:");
    if (error.response) {
      console.dir(error.response.data, { depth: null });
    }
    throw error;
  }
};