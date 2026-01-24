// src/handlers/messageHandler.ts
import { biz } from './bizData';
import { sendWhatsAppMessage } from '../services/whatsapp.service'; 
import { generateAIResponse } from '../services/groqService';

// Session interface
interface Session {
  phone: string;
  currentTopic: 'agentic_ai' | 'data_analytics' | null;
  conversationStage: 'new' | 'greeting' | 'topic_selected';
  lastQuestion: string | null;
  lastResponseType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Simple in-memory session store
const sessions = new Map<string, Session>();

// Helper functions
const cleanText = (text: string): string => {
  return text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
};

const getSession = (phone: string): Session => {
  if (!sessions.has(phone)) {
    sessions.set(phone, {
      phone,
      currentTopic: null,
      conversationStage: 'new',
      lastQuestion: null,
      lastResponseType: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return sessions.get(phone)!;
};

const updateSession = (phone: string, updates: Partial<Session>): Session => {
  const session = getSession(phone);
  Object.assign(session, updates, { updatedAt: new Date() });
  sessions.set(phone, session);
  return session;
};

// Main message handler function - COMPLETE VERSION
export const handleMessage = async (from: string, text: string, userName: string): Promise<void> => {
  const cleanTextMsg = cleanText(text);
  const session = getSession(from);
  
  console.log(`🤖 Processing message from ${userName} (${from}): ${text}`);

  /* ===== 1. FIRST: CHECK FOR SPECIFIC KEYWORDS & COMMANDS ===== */
  // Keep all your existing rule-based logic for reliable responses
  
  // GREETING HANDLER
  if (["hi", "hello", "hey", "hay", "hii", "hola", "good morning", "good afternoon", "good evening"].includes(cleanTextMsg)) {
    updateSession(from, { 
      currentTopic: null, 
      conversationStage: 'greeting' 
    });
    
    await sendWhatsAppMessage(from, `Hi ${userName}! 👋 Welcome to ${biz.company_name}.\n\nI'm your Career Advisor. Which program interests you?\n\n🤖 *Agentic AI*\n📊 *Data Analytics*\n\n*Reply with your choice.*`);
    return;
  }

  /* ===== TOPIC SELECTION ===== */
  // Handle AI variations
  if (cleanTextMsg.includes("agentic") || cleanTextMsg.includes("ai") || cleanTextMsg === "a" || cleanTextMsg === "ai") {
    updateSession(from, { 
      currentTopic: "agentic_ai",
      conversationStage: "topic_selected",
      lastQuestion: "overview"
    });
    
    const aiMsg = `🤖 *Agentic AI – Complete Overview*\n\n${biz.official_knowledge.faqs.agentic_ai_definition}\n\n*Key Learning Areas:*\n${biz.official_knowledge.detailed_info.agentic_ai.tools.map((t: string) => `• ${t}`).join('\n')}\n\n*What would you like to know?*\n\n1️⃣ Curriculum details\n2️⃣ Eligibility & requirements\n3️⃣ Placement support\n4️⃣ Fees & payment\n5️⃣ Class schedule\n6️⃣ Contact admissions team\n\n*Reply with the number (1-6) or ask your question.*`;
    
    await sendWhatsAppMessage(from, aiMsg);
    return;
  }

  // Handle Data Analytics variations
  if (cleanTextMsg.includes("data") || cleanTextMsg.includes("analytics") || cleanTextMsg === "d" || cleanTextMsg === "da") {
    updateSession(from, { 
      currentTopic: "data_analytics",
      conversationStage: "topic_selected",
      lastQuestion: "overview"
    });
    
    const dataMsg = `📊 *Data Analytics – Complete Overview*\n\n${biz.official_knowledge.faqs.data_analytics_definition}\n\n*Key Learning Areas:*\n${biz.official_knowledge.detailed_info.data_analytics.tools.map((t: string) => `• ${t}`).join('\n')}\n\n*What would you like to know?*\n\n1️⃣ Curriculum details\n2️⃣ Eligibility & requirements\n3️⃣ Placement support\n4️⃣ Fees & payment\n5️⃣ Class schedule\n6️⃣ Contact admissions team\n\n*Reply with the number (1-6) or ask your question.*`;
    
    await sendWhatsAppMessage(from, dataMsg);
    return;
  }

  /* ===== NUMBERED OPTIONS HANDLER (1-6) ===== */
  if (/^[1-6]$/.test(cleanTextMsg)) {
    const option = parseInt(cleanTextMsg);
    
    if (!session.currentTopic) {
      await sendWhatsAppMessage(from, "Please choose a program first:\n🤖 *Agentic AI* or 📊 *Data Analytics*");
      return;
    }

    const isAgentic = session.currentTopic === "agentic_ai";
    const topicName = isAgentic ? "Agentic AI" : "Data Analytics";
    const topicData = isAgentic ? biz.official_knowledge.detailed_info.agentic_ai : biz.official_knowledge.detailed_info.data_analytics;
    const emoji = isAgentic ? "🤖" : "📊";
    
    let response = "";
    
    switch(option) {
      case 1:
        response = `${emoji} *${topicName} Curriculum*\n\n*Tools & Technologies:*\n${topicData.tools.map((t: string, i: number) => `${i+1}. ${t}`).join('\n')}\n\n*Projects:* ${biz.official_knowledge.faqs.projects}\n\n*Coding:* ${isAgentic ? biz.official_knowledge.faqs.ai_coding : biz.official_knowledge.faqs.data_coding}`;
        break;
        
      case 2:
        response = `${emoji} *Eligibility for ${topicName}*\n\n*Who Can Join:*\n${biz.official_knowledge.faqs.eligibility.map((e: string) => `• ${e}`).join('\n')}\n\n*Background:* Both technical and non-technical welcome\n*Support:* Everything taught from scratch`;
        break;
        
      case 3:
        response = `${emoji} *Placement Support*\n\n*${biz.official_knowledge.detailed_info.placement.guarantee}*\n\n*Includes:*\n${biz.official_knowledge.detailed_info.placement.details.map((d: string) => `• ${d}`).join('\n')}\n\n*Career Roles:*\n${topicData.roles.map((r: string) => `• ${r}`).join('\n')}\n\n*Salary:* ${biz.official_knowledge.faqs.salary_expectation}`;
        break;
        
      case 4:
        response = `${emoji} *Fees & Payment*\n\n*${biz.official_knowledge.faqs.pay_after_placement}*\n\n*Registration:* ${biz.official_knowledge.faqs.registration_fee}\n*Refund:* ${biz.official_knowledge.faqs.refund_policy}`;
        break;
        
      case 5:
        response = `${emoji} *Class Schedule*\n\n*Format:* ${biz.official_knowledge.detailed_info.class_format.mode}\n*Recordings:* ${biz.official_knowledge.detailed_info.class_format.recordings}\n*Support:* ${biz.official_knowledge.detailed_info.class_format.support}`;
        break;
        
      case 6:
        response = `📞 *Contact Admissions Team*\n\nFor enrollment or detailed consultation:\n\n📝 Callback Form: ${biz.contact.callback_form}\n📧 Email: ${biz.contact.email}\n\n*Our team will contact you within 24 hours.*`;
        break;
    }

    updateSession(from, { 
      lastQuestion: `option_${option}`,
      lastResponseType: "numbered_response"
    });
    
    await sendWhatsAppMessage(from, response + `\n\n*Need more help?*\n• Type 'enroll' for admission\n• Type 'contact' to speak with advisor\n• Type 'switch' for other program`);
    return;
  }

  /* ===== KEYWORD HANDLERS ===== */
  // Handle "placement" keyword
  if (cleanTextMsg.includes("placement") || cleanTextMsg.includes("job") || cleanTextMsg.includes("career")) {
    if (session.currentTopic) {
      const isAgentic = session.currentTopic === "agentic_ai";
      const topicName = isAgentic ? "Agentic AI" : "Data Analytics";
      const topicData = isAgentic ? biz.official_knowledge.detailed_info.agentic_ai : biz.official_knowledge.detailed_info.data_analytics;
      const emoji = isAgentic ? "🤖" : "📊";
      
      const placementMsg = `${emoji} *Placement Support for ${topicName}*\n\n*${biz.official_knowledge.detailed_info.placement.guarantee}*\n\n*Includes:*\n${biz.official_knowledge.detailed_info.placement.details.map((d: string) => `• ${d}`).join('\n')}\n\n*Career Roles:*\n${topicData.roles.map((r: string) => `• ${r}`).join('\n')}\n\n*Salary:* ${biz.official_knowledge.faqs.salary_expectation}\n\n*Ready to start? Type 'enroll' now!*`;
      
      await sendWhatsAppMessage(from, placementMsg);
      return;
    }
  }

  // Handle "curriculum" keyword
  if (cleanTextMsg.includes("curriculum") || cleanTextMsg.includes("syllabus") || cleanTextMsg.includes("learn") || cleanTextMsg.includes("teach")) {
    if (session.currentTopic) {
      const isAgentic = session.currentTopic === "agentic_ai";
      const topicName = isAgentic ? "Agentic AI" : "Data Analytics";
      const topicData = isAgentic ? biz.official_knowledge.detailed_info.agentic_ai : biz.official_knowledge.detailed_info.data_analytics;
      const emoji = isAgentic ? "🤖" : "📊";
      
      const curriculumMsg = `${emoji} *${topicName} Curriculum*\n\n*Tools & Technologies:*\n${topicData.tools.map((t: string) => `• ${t}`).join('\n')}\n\n*Projects:* ${biz.official_knowledge.faqs.projects}\n\n*Want detailed modules? Type 'enroll' for full syllabus.`;
      
      await sendWhatsAppMessage(from, curriculumMsg);
      return;
    }
  }

  // Handle "enroll" or "join" keywords
  if (cleanTextMsg.includes("enroll") || cleanTextMsg.includes("join") || cleanTextMsg.includes("admission") || cleanTextMsg.includes("admit") || cleanTextMsg.includes("apply")) {
    const enrollMsg = `🎉 *Great! Ready to Enroll*\n\nFor admission process:\n\n📝 Callback Form: ${biz.contact.callback_form}\n📧 Email: ${biz.contact.email}\n\n*Our admissions team will contact you within 24 hours to discuss:*\n• Course suitability\n• Payment options\n• Batch availability\n• Career roadmap`;
    
    await sendWhatsAppMessage(from, enrollMsg);
    return;
  }

  // Handle "contact" or "email" keywords
  if (cleanTextMsg.includes("contact") || cleanTextMsg.includes("email") || cleanTextMsg.includes("mail") || cleanTextMsg.includes("call") || cleanTextMsg.includes("phone")) {
    const contactMsg = `📞 *Contact Our Team*\n\nFor immediate assistance:\n\n📧 Email: ${biz.contact.email}\n📝 Callback Form: ${biz.contact.callback_form}\n\n*Response time:* 2-4 hours during business days`;
    
    await sendWhatsAppMessage(from, contactMsg);
    return;
  }

  // Handle "fees" or "payment" keywords
  if (cleanTextMsg.includes("fee") || cleanTextMsg.includes("payment") || cleanTextMsg.includes("cost") || cleanTextMsg.includes("price")) {
    const feesMsg = `💰 *Fees & Payment Options*\n\n*${biz.official_knowledge.faqs.pay_after_placement}*\n\n*Registration:* ${biz.official_knowledge.faqs.registration_fee}\n*Refund:* ${biz.official_knowledge.faqs.refund_policy}\n\n*Need payment plan? Type 'enroll' to discuss options.*`;
    
    await sendWhatsAppMessage(from, feesMsg);
    return;
  }

  // Handle "eligibility" keyword
  if (cleanTextMsg.includes("eligibility") || cleanTextMsg.includes("qualification") || cleanTextMsg.includes("background")) {
    const eligibilityMsg = `✅ *Eligibility Criteria*\n\n*Who Can Apply:*\n${biz.official_knowledge.faqs.eligibility.map((e: string) => `• ${e}`).join('\n')}\n\n*No prior experience required* - We teach from scratch!\n\n*Unsure? Type 'enroll' for free consultation.*`;
    
    await sendWhatsAppMessage(from, eligibilityMsg);
    return;
  }

  // Handle "switch" keyword
  if (cleanTextMsg.includes("switch") || cleanTextMsg.includes("other") || cleanTextMsg.includes("change")) {
    if (session.currentTopic) {
      const newTopic = session.currentTopic === "agentic_ai" ? "data_analytics" : "agentic_ai";
      const emoji = newTopic === "agentic_ai" ? "🤖" : "📊";
      const topicName = newTopic === "agentic_ai" ? "Agentic AI" : "Data Analytics";
      
      updateSession(from, { 
        currentTopic: newTopic,
        conversationStage: "topic_selected"
      });
      
      const switchMsg = `${emoji} Switching to *${topicName}*!\n\nWould you like the complete overview? (yes/no)\n\nOr ask about:\n• Curriculum\n• Eligibility\n• Placement\n• Fees\n• Class schedule`;
      
      await sendWhatsAppMessage(from, switchMsg);
      return;
    }
  }

  // Handle "yes" response
  if (cleanTextMsg === "yes" || cleanTextMsg === "yeah" || cleanTextMsg === "yep" || cleanTextMsg === "sure") {
    if (session.currentTopic === "agentic_ai") {
      const aiOverview = `🤖 *Agentic AI – Complete Overview*\n\n${biz.official_knowledge.faqs.agentic_ai_definition}\n\n*Key Learning Areas:*\n${biz.official_knowledge.detailed_info.agentic_ai.tools.map((t: string) => `• ${t}`).join('\n')}\n\n*What would you like to know?*\n\n1️⃣ Curriculum details\n2️⃣ Eligibility & requirements\n3️⃣ Placement support\n4️⃣ Fees & payment\n5️⃣ Class schedule\n6️⃣ Contact admissions team`;
      await sendWhatsAppMessage(from, aiOverview);
      return;
    } else if (session.currentTopic === "data_analytics") {
      const dataOverview = `📊 *Data Analytics – Complete Overview*\n\n${biz.official_knowledge.faqs.data_analytics_definition}\n\n*Key Learning Areas:*\n${biz.official_knowledge.detailed_info.data_analytics.tools.map((t: string) => `• ${t}`).join('\n')}\n\n*What would you like to know?*\n\n1️⃣ Curriculum details\n2️⃣ Eligibility & requirements\n3️⃣ Placement support\n4️⃣ Fees & payment\n5️⃣ Class schedule\n6️⃣ Contact admissions team`;
      await sendWhatsAppMessage(from, dataOverview);
      return;
    }
  }

  // Handle "no" response
  if (cleanTextMsg === "no" || cleanTextMsg === "nope" || cleanTextMsg === "not now") {
    await sendWhatsAppMessage(from, `No problem ${userName}! I'm here whenever you're ready.\n\nYou can ask about:\n• Program details\n• Admission process\n• Career opportunities\n\nOr type "AI" or "Data" to explore programs.`);
    return;
  }

  // Handle "thank you"
  if (cleanTextMsg.includes("thank") || cleanTextMsg.includes("thanks")) {
    const topicDisplay = session.currentTopic ? 
      (session.currentTopic === "agentic_ai" ? "Agentic AI" : "Data Analytics") : 
      "our programs";
    
    await sendWhatsAppMessage(from, `You're very welcome, ${userName}! 😊\n\nIs there anything else you'd like to know about ${topicDisplay}?\n\n*For enrollment, type 'enroll' anytime.*`);
    return;
  }

  /* ===== 2. FINALLY: USE GROQ AI FOR EVERYTHING ELSE ===== */
  // If none of the above conditions matched, use the Groq AI
  console.log(`🤖 No keyword match for "${text}". Using Groq AI...`);
  
  try {
    // Update session to track we're in AI mode
    updateSession(from, {
      lastResponseType: "ai_generated"
    });
    
    // Get AI response from Groq
    const aiResponse = await generateAIResponse(text, userName, session);
    
    // Send the AI response
    await sendWhatsAppMessage(from, aiResponse);
    
  } catch (error) {
    console.error("❌ Error in AI response generation:", error);
    
    // Fallback message if AI fails
    const fallbackMsg = `I want to make sure I provide you with the most accurate information! For specific enrollment queries or detailed program information, I recommend:\n\n1. Filling our callback form: ${biz.contact.callback_form}\n2. Emailing us: ${biz.contact.email}\n3. Exploring our programs: 'AI' or 'Data'\n\nHow can I assist you further?`;
    
    await sendWhatsAppMessage(from, fallbackMsg);
  }
};