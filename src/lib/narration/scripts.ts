const ENGLISH = `Hello, my little one. I am so happy to sit with you tonight and tell you a story. The moon looks like a round laddoo, and the stars are tiny diyas, twinkling just for you.

Once, on a Diwali night, a small clay lamp waited on the windowsill. Its flame was gold and sleepy. It danced left, then right, very slowly. A peacock far away heard the monsoon and opened his feathers, but he did not shout. He only shimmered, and then he tucked his head under his wing.

We will have one sweet, only one, and a sip of warm milk. Then the razai comes up to your chin. I am right here. Nothing in this story is in a hurry. When the lamp goes quiet, the light stays in your heart.

I love you. Shubh ratri. Good night, my dear one. I will be here for the next story too.`;

export function recordingScript(language: string) {
  if (language === "hindi") {
    return `नमस्ते, मेरे प्यारे बच्चे। आज रात मैं तुम्हारे पास बैठकर एक धीमी कहानी सुनाने आया हूँ, या आई हूँ। चाँद एक गोल लड्डू जैसा है, और तारे छोटे दिए हैं, सिर्फ तुम्हारे लिए टिमटिमाते हुए।

एक दिवाली की रात को खिड़की पर एक छोटा मिट्टी का दिया इंतज़ार कर रहा था। उसकी लौ सोने जैसी थी, और थोड़ी नींद में थी। वह धीरे से बाएँ गई, फिर दाएँ। दूर कहीं मोर ने बारिश सुनकर अपने पंख खोले, पर वह चिल्लाया नहीं। वह बस चमकता रहा, और फिर सिर को पंख में छुपा लिया।

हम एक मीठी चीज़ लेंगे, बस एक, और गर्म दूध की एक चुस्की। फिर रज़ाई ठुड्डी तक आ जाएगी। मैं यहीं हूँ। इस कहानी में कोई जल्दी नहीं है। जब दिया शांत हो जाए, रोशनी तुम्हारे दिल में रहती है।

मैं तुमसे प्यार करता हूँ, और प्यार करती हूँ। शुभ रात्रि। गुड नाईट, मेरे बच्चे। अगली कहानी के लिए भी मैं यहीं रहूँगा, रहूँगी।`;
  }
  if (language === "telugu") {
    return `నమస్తే, నా ప్రాణం. ఈ రాత్రి నేను నీ పక్కన కూర్చుని ఒక మెత్తని కథ చెబుతాను. చంద్రుడు ఒక గుండ్రని లడ్డూ లా ఉన్నాడు. నక్షత్రాలు చిన్న దీపాలు, కేవలం నీ కోసం మిణుకు మిణుకుమంటున్నాయి.

ఒక దీపావళి రాత్రి కిటికీ మీద ఒక చిన్న మట్టి దీపం వేచి ఉంది. మంట బంగారం లా నిద్రమత్తులో ఊగింది. ఎడమకు, కుడికి, చాలా నెమ్మదిగా. దూరాన నెమలి వర్షం విని ఈకలు తెరిచింది, కానీ అరవలేదు. మెరుస్తూ, తలను రెక్కలో దాచుకుంది.

మనం ఒకే ఒక తీపి తింటాం, వెచ్చని పాలు ఒక సిప్ తాగుతాం. దుప్పటి గడ్డం దాకా వస్తుంది. నేనిక్కడే ఉన్నాను. ఈ కథలో తొందర ఏమీ లేదు. దీపం ఆగినా వెలుగు నీ గుండెలో ఉంటుంది.

నిన్ను ప్రేమిస్తున్నాను. శుభరాత్రి. గుడ్ నైట్, నా బంగారం. వచ్చే కథకూ నేను ఇక్కడే ఉంటాను.`;
  }
  if (language === "kannada") {
    return `ನಮಸ್ತೆ, ನನ್ನ ಕಂದ. ಇಂದು ರಾತ್ರಿ ನಾನು ನಿನ್ನ ಬಳಿ ಕುಳಿತು ಒಂದು ಮೃದುವಾದ ಕಥೆ ಹೇಳುತ್ತೇನೆ. ಚಂದ್ರ ಒಂದು ದುಂಡನೆಯ ಲಡ್ಡು ಹಾಗೆ ಕಾಣುತ್ತಾನೆ. ನಕ್ಷತ್ರಗಳು ಚಿಕ್ಕ ದೀಪಗಳು, ನಿನಗಾಗಿ ಮಿನುಗುತ್ತಿವೆ.

ಒಂದು ದೀಪಾವಳಿ ರಾತ್ರಿ ಕಿಟಕಿಯ ಮೇಲೆ ಒಂದು ಸಣ್ಣ ಮಣ್ಣಿನ ದೀಪ ಕಾಯುತ್ತಿತ್ತು. ಜ್ವಾಲೆ ಚಿನ್ನದಂತೆ, ಸ್ವಲ್ಪ ನಿದ್ರೆಯಲ್ಲಿ, ಎಡಕ್ಕೆ ಬಲಕ್ಕೆ ನಿಧಾನವಾಗಿ ಆಡಿತು. ದೂರದಲ್ಲಿ ನವಿಲು ಮಳೆ ಕೇಳಿ ಗರಿಗಳನ್ನು ಬಿಚ್ಚಿತು, ಆದರೆ ಕೂಗಲಿಲ್ಲ. ಹೊಳೆಯುತ್ತಾ ತಲೆಯನ್ನು ರೆಕ್ಕೆಯಲ್ಲಿ ಅಡಗಿಸಿಕೊಂಡಿತು.

ನಾವು ಒಂದೇ ಸಿಹಿ ತಿನ್ನುತ್ತೇವೆ, ಬೆಚ್ಚನೆಯ ಹಾಲಿನ ಒಂದು ಸಿಪ್ ಕುಡಿಯುತ್ತೇವೆ. ಕಂಬಳಿ ಗದ್ದದವರೆಗೆ ಬರುತ್ತದೆ. ನಾನು ಇಲ್ಲೇ ಇದ್ದೇನೆ. ಈ ಕಥೆಯಲ್ಲಿ ಯಾವ ಅವಸರವೂ ಇಲ್ಲ. ದೀಪ ನಿಂತರೂ ಬೆಳಕು ನಿನ್ನ ಹೃದಯದಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.

ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ. ಶುಭ ರಾತ್ರಿ. ಗುಡ್ ನೈಟ್, ನನ್ನ ಕಂದ. ಮುಂದಿನ ಕಥೆಗೂ ನಾನು ಇಲ್ಲೇ ಇರುತ್ತೇನೆ.`;
  }
  if (language === "tenglish") {
    return `${ENGLISH}

Telugu words to keep warm in your voice: varsham means rain, deepam means the little lamp, bangaram means gold, and my precious one. Say them slowly, the way you would at home.`;
  }
  if (language === "kanglish") {
    return `${ENGLISH}

Kannada words to keep warm in your voice: male means rain, deepa means the little lamp, kanda means my beloved child. Say them slowly, the way you would at home.`;
  }
  return ENGLISH;
}
