export const getReply = (text: string) => {
    text = text.toLowerCase();
  
    if (text.includes("price"))
      return "💰 Course price is ₹999 (lifetime access).";
  
    if (text.includes("course"))
      return "📚 WhatsApp Automation + Excel Bot training.";
  
    if (text.includes("demo"))
      return "🎥 Demo available. Reply YES to get demo link.";
  
    if (text.includes("help"))
      return "🤝 Ask about price, course, demo or support.";
  
    return "❗ Please ask questions related to our course only.";
  };
  