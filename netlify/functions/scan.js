const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { image } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "API Key not configured in Netlify" }) };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { inlineData: { mimeType: "image/jpeg", data: image } },
                        { text: "Identify this waste item. Return response in Sinhala only. Format exactly as: ද්‍රව්‍යය: [Name], බර: [X]kg, ඇස්තමේන්තුගත ප්‍රතිචක්‍රීකරණ මිල: රු. [Price]. Add a brief eco-friendly disposal tip." }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            return { statusCode: 500, body: JSON.stringify({ error: "AI could not recognize the image" }) };
        }

        const aiText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: aiText })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
