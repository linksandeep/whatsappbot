Use nodemon (recommended for stability)
npm run dev:nodemon
npx ngrok http 4000
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



    PORT=4000
MONGO_URI=mongodb://localhost:27017

WHATSAPP_TOKEN=EAALFNT2mgUFd4ydnxMZBz4EoqsTjutOfD7NVTvEMMjB4xIu337F3LPQ9wZDZD
WHATSAPP_PHONE_NUMBER_ID=9428
WHATSAPP_API_VERSION=v24.0
VERIFY_TOKEN=edtech_secret_123

# For testing
WHATSAPP_TEMPLATE_NAMEhfdh=hello_world

# For later use
COMMUNITY_LINK=https://your-community-link.com

MONGO_URL=mongodb+srv://dipanshu2000000_db_user:vBAiGB6vYAtVBXrS@cluster0.tsghnsf.mongodb.net/your_db_name?retryWrites=true&w=majority
COM_LINK=www.google.com
GROQ_MODEL=llama-3.3-70b-versatile  # or mixtral-8x7b-32768
SUPPORTED_LANGUAGES=en,hi,es,fr,de  # Add more as needed
nwe=98222287
new2=100902287799
