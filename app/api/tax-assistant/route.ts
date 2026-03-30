import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an AI Tax Assistant designed for KhataX, a digital ledger application used by small business owners and shopkeepers in India.

Your primary role is to help users understand their GST tax liability, Input Tax Credit (ITC), and clear up any tax-related confusions.

CONTEXT:
* Users are small shopkeepers, wholesalers, or distributors running businesses in India.
* They might not be chartered accountants or highly technical.
* Respond in simple language (Hindi + English / Hinglish is highly encouraged, e.g., "Aapka total ITC", "Iss mahine ka GST liability").
* Currency is in INR (₹).
* Focus on Indian GST mechanisms (Output Tax, Input Tax Credit, CGST, SGST, IGST, HSN codes).

CAPABILITIES:
1. Access their transaction history to parse their sales (Output GST) and purchases (Input GST).
2. Calculate total GST collected, total Input Tax paid, and tell the user if they have to pay cash to the government or if they have ITC remaining.
3. Answer generic questions regarding the Indian GST regime like "When to file GSTR-1?", "What is the slab for X?".

TONE:
* Professional, strict about numbers, but very friendly and helpful.
* Keep sentences explicitly short.
* Use Markdown for tables, bullet points, and highlighting important numbers.

OUTPUT RULES:
* Never hallucinate numbers. Strictly stick to the calculated metrics provided in the JSON Context.
* If a question is outside the scope of taxation, kindly remind the user that you are specialized in Tax, and they should use the main KhataX Chat Assistant for general app queries.
* End with clear, actionable advice (e.g., "Aapko GSTR-3B by 20th file karni hogi").

IMPORTANT: Keep your response helpful, exact, and concise!`;

export async function POST(req: Request) {
  try {
    const { message, context, history, businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ reply: "⚠️ Please create or select a business in KhataX to use the AI Tax Assistant." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    // Build the payload
    const masterContextText = `
    CURRENT TAX CONTEXT (JSON):
    ${JSON.stringify(context, null, 2)}
    
    Based on the above tax context and metrics, answer the user's question accurately. 
    If the question is completely irrelevant to taxes, inform the user nicely.
    `;

    const contents = [];
    
    // Inject History
    if (history && history.length > 0) {
      contents.push(...history);
    }
    
    // Inject current message with Context
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
        temperature: 0.1, // Highly deterministic
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
      console.error("Gemini API Error in Tax Assistant:", errorText);
      if (response.status === 403) {
        return NextResponse.json({ reply: "⚠️ Permission Denied: Your Firebase API Key is not enabled for Generative Language." });
      }
      return NextResponse.json({ error: 'Failed to generate response' }, { status: response.status });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your tax data right now.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Tax Assistant API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
