// services/groqService.ts
import { Groq } from 'groq-sdk'; // You'll need to install this package
import { biz } from '../utills/bizData'; 

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY // Store your key in .env
});

// Your new "brain" function
export async function generateAIResponse(userMessage: string, userName: string, sessionContext?: any): Promise<string> {
  
  // 1. Construct a system prompt to guide the AI
  const systemPrompt = `You are "EduBot", the helpful and enthusiastic career advisor for ${biz.company_name}.
  Your goal is to guide users interested in our programs: Agentic AI and Data Analytics.
  You have the following knowledge about the company: ${JSON.stringify(biz.official_knowledge.faqs)}.
  Always be concise, friendly, and encouraging. If asked about something outside your knowledge, politely direct them to fill the callback form or email.`;
  
  // 2. (Optional) Build a message history from the session for context
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `${userName} asks: ${userMessage}` }
  ];
  
  // 3. Call the Groq API
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama3-8b-8192", // Or another Groq model[citation:2][citation:6]
      temperature: 0.7,
      max_tokens: 500, // Keep replies WhatsApp-friendly
    });
    
    // 4. Return the AI-generated text
    return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response at the moment.";
    
  } catch (error) {
    console.error("Groq API error:", error);
    // Return a friendly fallback message
    return `Hi ${userName}! I'm having trouble processing that right now. For immediate help, please email us at ${biz.contact.email}.`;
  }
}