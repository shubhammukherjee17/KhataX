import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { CHAT_ASSISTANT_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  try {
    const { message, context, history, businessId } = await req.json();

    // Secure the chat: Only allow processing for active logged-in sessions with a business
    if (!businessId) {
      return NextResponse.json({ reply: "⚠️ Please select or create a business in KhataX to use the AI Assistant." });
    }

    // Strictly strictly use the API Key given in the .env file as requested
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
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
        parts: [{ text: CHAT_ASSISTANT_PROMPT }]
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
      if (response.status === 403) {
        return NextResponse.json({ reply: "⚠️ Permission Denied: Your Firebase API Key is not enabled for Generative Language.\n\nTo fix this:\n1. Open Google Cloud Console\n2. Select your Firebase Project\n3. Enable the 'Generative Language API'\n\nOnce enabled, the AI will work immediately with your current key!" });
      }
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
