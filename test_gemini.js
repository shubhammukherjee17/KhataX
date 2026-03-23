const apiKey = "AIzaSyCgi_CGSN7l8A_9FmGaJMPEFGKV9zaRJkk";
const SYSTEM_PROMPT = "You are an AI financial assistant.";
const message = "Hello";
const context = { total_sales: 1000 };

const masterContextText = `
CURRENT APPLICATION STATE (JSON):
${JSON.stringify(context, null, 2)}

Use the above data to answer the user's questions accurately.
`;

const contents = [
  {
    role: 'user',
    parts: [{ text: masterContextText + "\n\nUser Question: " + message }]
  }
];

const payload = {
  systemInstruction: {
    parts: [{ text: SYSTEM_PROMPT }]
  },
  contents,
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 1024,
  }
};

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
.then(res => res.text().then(text => console.log(res.status, text)))
.catch(console.error);
