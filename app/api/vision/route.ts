import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    
    // Strictly strictly use the API Key given in the .env file as requested
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || 'image/jpeg';

    const payload = {
      systemInstruction: {
        parts: [{ text: "You are KhataX AI. Extract details from the receipt. Respond STRICTLY in valid JSON matching this schema: {\"vendorName\":\"name\",\"date\":\"YYYY-MM-DD\",\"number\":\"invoice_num\",\"items\":[{\"name\":\"item\",\"quantity\":number,\"rate\":number,\"taxRate\":number}]} Do NOT wrap in markdown formatting." }]
      },
      contents: [{
        parts: [
          { inlineData: { mimeType, data: base64Data } }
        ]
      }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const e = await response.text();
      console.error(e);
      if (response.status === 403) {
        return NextResponse.json({ error: 'PERMISSION_DENIED' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Vision API Failed' }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    return NextResponse.json({ result: resultText });
  } catch (error) {
    console.error("Vision Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
