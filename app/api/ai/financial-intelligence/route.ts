import { NextResponse } from 'next/server';
import { FINANCIAL_INTELLIGENCE_PROMPT } from '@/lib/ai/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { transactions, businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
    }

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Missing or invalid transactions input" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: FINANCIAL_INTELLIGENCE_PROMPT }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: "Here are the transactions:\n" + JSON.stringify(transactions) }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error in financial-intelligence:", errorText);
      return NextResponse.json({ error: 'Failed to process AI request' }, { status: response.status });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let parsedData = {};
    try {
      parsedData = JSON.parse(replyText);
    } catch(e) {
      console.error("Failed to parse", e);
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }

    return NextResponse.json({ insights: parsedData });
  } catch (error) {
    console.error("Financial Intelligence API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
