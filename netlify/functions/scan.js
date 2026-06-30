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
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'සර්වර් එකේ GEMINI_API_KEY එක සෙට් කර නැත!' }) };
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [
                    { text: "Identify this object for waste management and respond shortly in Sinhala." },
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

        // ගූගල් එකෙන් කෙලින්ම එන Error එකක් තිබ්බොත් ඒක පෙන්වීම
        if (data.error) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: `Google API Error: ${data.error.message} (Code: ${data.error.code})` }) };
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiText = data.candidates[0].content.parts[0].text;
            return { statusCode: 200, headers, body: JSON.stringify({ text: aiText }) };
        } 
        
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'AI එකෙන් පිළිතුරක් ආවේ නැත. (Response structure issue)' }) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server Error: ' + error.message }) };
    }
};
