const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    // CORS ගැලපීම් සඳහා headers සැකසීම
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const base64Image = body.image;

        if (!base64Image) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'පින්තූරයක් ලැබී නැත.' }) };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'API Key එක සෙට් කර නැත.' }) };
        }

        // Gemini API එකට Request එක සකස් කිරීම
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [
                {
                    parts: [
                        { text: "ඔබ අපද්‍රව්‍ය කළමනාකරණය පිළිබඳ විශේෂඥයෙකි. මෙම පින්තූරයේ ඇති ද්‍රව්‍යය කුමක්දැයි හඳුනාගෙන, එය ප්‍රතිචක්‍රීකරණය කළ හැකිද (Recyclable) නැද්ද යන්න සහ එය බැහැර කළ යුතු නිවැරදි ක්‍රමය කෙටියෙන් සිංහල භාෂාවෙන් (In Sinhala) පවසන්න." },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Gemini එකෙන් ආපු උත්තරය වෙන් කර ගැනීම
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            return { statusCode: 200, headers, body: JSON.stringify({ text: aiText }) };
        } else {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'AI එකට පින්තූරය තේරුම් ගත නොහැකි විය.' }) };
        }

    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server Error: ' + error.message }) };
    }
};
