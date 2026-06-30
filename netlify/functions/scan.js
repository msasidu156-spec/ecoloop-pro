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

        // 🎯 මෙතන v1beta වෙනුවට v1 සහ ස්ථාවර මොඩල් එකක් පාවිච්චි කරලා තියෙනවා
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [
                    { text: "ඔබ අපද්‍රව්‍ය කළමනාකරණය පිළිබඳ විශේෂඥයෙකි. මෙම පින්තූරයේ ඇති ද්‍රව්‍යය කුමක්දැයි හඳුනාගෙන, එය ප්‍රතිචක්‍රීකරණය කළ හැකිද (Recyclable) නැද්ද යන්න සහ එය බැහැර කළ යුතු නිවැရදි ක්‍රමය කෙටියෙන් සිංහල භාෂාවෙන් (In Sinhala) පවසන්න." },
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

        if (data.error) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: `Google API Error: ${data.error.message}` }) };
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiText = data.candidates[0].content.parts[0].text;
            return { statusCode: 200, headers, body: JSON.stringify({ text: aiText }) };
        } 
        
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'AI එකෙන් ප්‍රතිචාරයක් ආවේ නැත.' }) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'සර්වර් දෝෂයකි: ' + error.message }) };
    }
};
