const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const base64Image = body.image;

        if (!base64Image) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'පින්තූරයක් ලැබී නැත.' }) };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'සර්වර් එකේ GEMINI_API_KEY එක සෙට් කර නැත.' }) };
        }

        // Gemini API Endpoint
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [
                    { text: "Identify this waste item and tell me how to recycle it shortly in Sinhala." },
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                ]
            }]
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 🔍 Google එකෙන් කෙලින්ම එන වැරැද්ද අහුවෙන තැන
        if (data.error) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: `Google API Error: ${data.error.message}` }) };
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiText = data.candidates[0].content.parts[0].text;
            return { statusCode: 200, headers, body: JSON.stringify({ text: aiText }) };
        } 
        
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'AI එකෙන් ප්‍රතිචාරයක් ආවේ නැත. කරුණාකර නැවත උත්සාහ කරන්න.' }) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'සර්වර් දෝෂයකි: ' + error.message }) };
    }
};
