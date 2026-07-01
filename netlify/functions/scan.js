// 1. ඔයාගේ Netlify එකේ තියෙන API Key එක මෙතනට කෙලින්ම දාන්න මචං
const GEMINI_API_KEY = "ඔයාගේ_ඇත්තම_GEMINI_API_KEY_එක_මෙතනට_දාන්න";

async function scanImage(base64Image) {
    const resultArea = document.getElementById("ai-report-text"); // ඔයාගේ රිපෝට් එක වැටෙන ID එක මෙතනට දාන්න
    resultArea.innerText = "විශ්ලේෂණය කරමින් පවතී...";

    try {
        // ගූගල් එකේ නිවැරදිම Frontend Endpoint එක
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "ඔබ අපද්‍රව්‍ය කළමනාකරණය පිළිබඳ විශේෂඥයෙකි. මෙම පින්තූරයේ ඇති ද්‍රව්‍යය කුමක්දැයි හඳුනාගෙන, එය ප්‍රතිචක්‍රීකරණය කළ හැකිද නැද්ද යන්න සහ එය බැහැර කළ යුතු නිවැරදි ක්‍රමය කෙටියෙන් සිංහල භාෂාවෙන් පවසන්න." },
                        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            resultArea.innerText = data.candidates[0].content.parts[0].text;
        } else {
            resultArea.innerText = "දෝෂයකි: පින්තූරය හඳුනාගත නොහැකි විය.";
        }
    } catch (error) {
        resultArea.innerText = "දෝෂයකි: " + error.message;
    }
}
