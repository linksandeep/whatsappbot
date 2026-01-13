Use nodemon (recommended for stability)
npm run dev:nodemon

Use ts-node-dev (faster rebuilds)
npm run dev:tsnode


Both are valid. Both auto-restart.


Excel / Meta Leads
      ↓
Lead Ingestion API
      ↓
MongoDB (Users)
      ↓
WhatsApp Template Message
      ↓
User Replies
      ↓
Webhook
      ↓
Rule Guard
      ↓
Gemini (Product Only)
      ↓
WhatsApp Reply
  Node v18 or above   
Layer	Choice
Language	TypeScript
Runtime	Node.js
Framework	Express
DB	MongoDB (Atlas)
Messaging	WhatsApp Cloud API
AI	Gemini
Input	Excel / Meta
    # Server
PORT=3000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/whatsappBot?retryWrites=true&w=majority

# WhatsApp Cloud API
WHATSAPP_TOKEN=YOUR_WHATSAPP_CLOUD_API_TOKEN
PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
VERIFY_TOKEN=YOUR_VERIFY_TOKEN

# Gemini AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   src/
├── server.ts
├── config.ts
├── db.ts
├── models/
│   ├── User.ts
│   └── Message.ts
├── routes/
│   ├── upload.ts
│   └── webhook.ts
├── services/
│   ├── whatsapp.service.ts
│   ├── chatbot.service.ts
│   ├── gemini.service.ts
│   └── lead.service.ts
└── utils/
    └── productScope.ts