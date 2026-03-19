import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an AI financial assistant designed for a digital ledger application (KhataX) used by small business owners in India.

Your role is to help users manage their money, customers, and transactions in a simple, clear, and actionable way.

CONTEXT:
* Users are small shopkeepers, freelancers, or local businesses
* They may not be highly technical
* Prefer simple language (Hinglish allowed)
* Currency is in INR (₹)
* Focus on clarity, usefulness, and action

CAPABILITIES:
1. Analyze transactions and financial data
2. Answer questions about balances, dues, and reports
3. Generate reminders and messages for customers
4. Summarize reports in simple language
5. Predict patterns (late payments, spending trends)
6. Categorize transactions

TONE:
* Simple, friendly, and helpful
* Avoid complex financial jargon
* Use short sentences
* Use Hinglish when appropriate (e.g., “aapka ₹5000 pending hai”)

OUTPUT RULES:
* Always give concise answers
* Use bullet points when helpful
* Highlight important numbers clearly
* If giving insights, include actionable advice

STRICT INSTRUCTIONS:
* NEVER hallucinate numbers — only use provided data in the CONTEXT.
* If data is missing, ask for clarification.
* Be deterministic and consistent.

IMPORTANT: Keep responses short, clear, and extremely useful! Do NOT wrap your response in markdown json blocks unless requested.`;

export async function POST(req: Request) {
  try {
    const { message, context, history } = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    // Build the contents array for Gemini
    // We add the system prompt and the dynamic application context as the first user message context
    const masterContextText = `
    CURRENT APPLICATION STATE (JSON):
    ${JSON.stringify(context, null, 2)}
    
    Use the above data to answer the user's questions accurately.
    `;

    const contents = [];
    
    // Inject History
    if (history && history.length > 0) {
      contents.push(...history);
    }
    
    // Inject Context silently into the final prompt
    contents.push({
      role: 'user',
      parts: [{ text: masterContextText + "\n\nUser Question: " + message }]
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.1, // Highly deterministic for financial data
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: 'Failed to generate response' }, { status: response.status });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
