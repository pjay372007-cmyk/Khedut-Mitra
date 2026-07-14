/**
 * iKhedut Krushi Mitra — NLP Chat & RAG Engine
 */

window.cropAI = window.cropAI || {};

const ChatEngine = {
  currentResult: null,

  intents: [
    { id: 'treatment', keywords: ['treat', 'medicine', 'spray', 'fungicide', 'pesticide', 'chemical', 'cure', 'fix', 'control', 'apply', 'dose', 'dosage', 'dava', 'davai', 'દવા'] },
    { id: 'cost', keywords: ['cost', 'price', 'rupee', '₹', 'how much', 'kitna', 'kharcho', 'ખર્ચ', 'paisa'] },
    { id: 'prevention', keywords: ['prevent', 'avoid', 'next season', 'protection', 'protect', 'rokavo', 'bachav', 'bachao', 'prevention', 'stop'] },
    { id: 'organic', keywords: ['organic', 'natural', 'neem', 'bio', 'jaivik', 'chemical free', 'no chemical', 'safe', 'eco'] },
    { id: 'duration', keywords: ['how long', 'days', 'recover', 'how many days', 'keti vakhat', 'kitne din', 'time', 'recovery'] },
  ],

  generateReply(message, currentResult) {
    this.currentResult = currentResult;
    const msg = message.toLowerCase();
    const isGuj = window.KrishiStorage.isGujarati();

    // 1. Identify Intent
    let matchedIntent = 'general';
    for (const intent of this.intents) {
      if (intent.keywords.some(kw => msg.includes(kw))) {
        matchedIntent = intent.id;
        break;
      }
    }

    // 2. Route Response based on context
    if (!currentResult || currentResult.id === 'healthy') {
      return this._handleHealthyOrGeneral(matchedIntent, isGuj);
    } else {
      return this._handleDiseaseContext(matchedIntent, currentResult, isGuj);
    }
  },

  _handleHealthyOrGeneral(intent, isGuj) {
    if (isGuj) {
      const responses = {
        treatment: "તમારા પાકમાં કોઈ રોગ નથી, તેથી દવાની જરૂર નથી. સામાન્ય સંભાળ ચાલુ રાખો.",
        cost: "સ્વસ્થ પાકમાં કોઈ સારવારનો ખર્ચ થતો નથી! 🌾",
        prevention: "નિવારણ માટે: પાકની ફેરબદલી કરો, ગુણવત્તાવાળા બિયારણ વાપરો અને વધુ પડતું પાણી ન આપો.",
        organic: "જૈવિક કાળજી માટે જીવામૃત અથવા લીંબોળીનું તેલ (૫ મિલી/લીટર) વાપરી શકાય છે.",
        duration: "નિયમિત દેખરેખ ચાલુ રાખો. સામાન્ય પ્રશ્નો પૂછો.",
        general: "નમસ્તે! હું તમારી ખેતીમાં મદદ કરી શકું છું. પાક સુરક્ષા, હવામાન અથવા ખાતર વિશે પૂછો."
      };
      return responses[intent] || responses.general;
    } else {
      const responses = {
        treatment: "Your crop is healthy! No chemical sprays are needed. Maintain normal irrigation.",
        cost: "No treatment cost is required for healthy crops! 🌾",
        prevention: "To prevent diseases: Rotate crops, select certified seeds, and avoid over-irrigation.",
        organic: "For organic tonic, use Jeevamrut or preventive Neem oil spray @ 5ml/liter.",
        duration: "Keep monitoring your fields. Ask me about weather, APMC rates, or calculator.",
        general: "Hello! I am your farming assistant. You can ask me about crop protection, weather, or mandi rates."
      };
      return responses[intent] || responses.general;
    }
  },

  _handleDiseaseContext(intent, res, isGuj) {
    const treatments = res.treatment || [];
    const diseaseName = isGuj ? (res.namegu || res.name) : res.name;

    if (isGuj) {
      switch (intent) {
        case 'treatment':
          const treatText = treatments.map(t => `• **${t.title}**: ${t.desc}`).join('\n');
          return `**${diseaseName}** ની સારવાર:\n\n${treatText || 'સામાન્ય કાળજી અને રોગિષ્ઠ ભાગોનો નાશ કરવો.'}\n\n💊 **ડોઝ**: ${res.chemicalDose || 'માહિતી નથી'}`;
        case 'cost':
          return `**${diseaseName}** સારવાર માટે અંદાજિત ખર્ચ: **${res.estimatedCost || 'માહિતી નથી'}**.`;
        case 'prevention':
          return `**${diseaseName}** નિવારણ:\n${res.preventive || 'રોગ ફેલાતો અટકાવવા માટે રોગિષ્ઠ પાકનો નાશ કરો.'}`;
        case 'organic':
          const bio = treatments.find(t => t.icon?.includes('leaf') || t.title.toLowerCase().includes('neem') || t.title.toLowerCase().includes('organic'));
          if (bio) {
              return `🌿 **જૈવિક ઉપાય**: **${bio.title}**\n${bio.desc}`;
          }
          return `🌿 **જૈવિક નિયંત્રણ**: લીંબોળીના તેલ (૧૦૦૦૦ PPM) નો ૫ મિલી/લીટર પાણીમાં ભેળવી છંટકાવ કરવો. રોગિષ્ઠ પાક ઉખેડી બાળી નાખવો.`;
        case 'duration':
          return `દવાનો છંટકાવ કર્યા પછી સામાન્ય રીતે **૭ થી ૧૦ દિવસ** માં સુધારો જોવા મળે છે. જો રોગ ચાલુ રહે તો ૧૫ દિવસે ફરી છાંટવું.`;
        default:
          return `🔬 રોગ: **${diseaseName}**\n⚠️ તીવ્રતા: ${res.severity}\n\nદવા અને ડોઝ વિશે પૂછવા માટે "દવા" અથવા સારવારના ખર્ચ માટે "ખર્ચ" ટાઈપ કરો.`;
      }
    } else {
      switch (intent) {
        case 'treatment':
          const treatText = treatments.map(t => `• **${t.title}**: ${t.desc}`).join('\n');
          return `Treatment for **${diseaseName}**:\n\n${treatText || 'Field sanitation and rogue out infected plants.'}\n\n💊 **Chemical Dose**: ${res.chemicalDose || 'N/A'}`;
        case 'cost':
          return `Estimated treatment cost for **${diseaseName}**: **${res.estimatedCost || 'N/A'}**.`;
        case 'prevention':
          return `Prevention practices for **${diseaseName}**:\n${res.preventive || 'Maintain clean field and use resistant varieties.'}`;
        case 'organic':
          const bio = treatments.find(t => t.icon?.includes('leaf') || t.title.toLowerCase().includes('neem') || t.title.toLowerCase().includes('organic'));
          if (bio) {
              return `🌿 **Organic/Biological Option**: **${bio.title}**\n${bio.desc}`;
          }
          return `🌿 **Organic Control**: Spray Neem Oil (10000 ppm) @ 5 ml/liter water. Remove and destroy infected leaves immediately.`;
        case 'duration':
          return `Improvement is typically seen within **7 to 10 days** after applying treatment. Re-apply after 14 days if symptoms persist.`;
        default:
          return `🔬 Diagnosis: **${diseaseName}**\n⚠️ Severity: ${res.severity}\n\nYou can ask "What is the medicine?" or "How much does it cost?" for more details.`;
      }
    }
  }
};

// Bind to global cropAI namespace
Object.assign(window.cropAI, {
  chatHistory: [],

  async _sendChat() {
    const input = document.getElementById('ai-chat-input');
    const text = (input?.value || '').trim();
    if (!text || this.isProcessing) return;
    input.value = '';

    this._appendBubble('user', text);
    this.chatHistory.push({ role: 'user', text });

    const sendBtn = document.getElementById('ai-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    this._showTyping();

    const engineMode = window.KrishiStorage.getEngineMode();
    const apiKey = window.KrishiStorage.getGeminiApiKey();
    const isGuj = window.KrishiStorage.isGujarati();
    let reply = '';

    try {
      // 1. Build client-side searchable documents index
      const allLocalDocs = [];
      if (window.KB) {
        if (window.KB.diseases) window.KB.diseases.forEach(d => allLocalDocs.push({ ...d, docType: 'disease' }));
        if (window.KB.crops) window.KB.crops.forEach(c => allLocalDocs.push({ ...c, docType: 'crop' }));
        if (window.KB.pests) window.KB.pests.forEach(p => allLocalDocs.push({ ...p, docType: 'pest' }));
        if (window.KB.faqs) window.KB.faqs.forEach(f => allLocalDocs.push({ ...f, docType: 'faq' }));
      }

      // 2. Query search engine
      let matches = [];
      if (typeof SearchEngine !== 'undefined') {
        matches = SearchEngine.search(text, allLocalDocs);
      }

      const bestMatch = matches.length > 0 ? matches[0] : null;
      const score = bestMatch ? bestMatch.score : 0;
      
      console.log(`[RAG Search] Best match score: ${score}`, bestMatch);

      // 3. Routing decision tree
      if (score >= 2.5) {
        // Route A: High Confidence -> Complete Offline Response
        const doc = bestMatch.doc;
        if (doc.docType === 'disease') {
          reply = isGuj
            ? `**${doc.namegu || doc.name}** ના ઉપાયો:\n\n📖 **લક્ષણો**: ${doc.symptoms ? doc.symptoms.join(', ') : doc.description}\n\n💊 **દવા અને ડોઝ**: ${doc.chemicalDose || 'લાગુ પડતું નથી'}\n\n🛡️ **નિવારક પગલાં**: ${doc.preventive || 'લાગુ પડતું નથી'}`
            : `Information about **${doc.name}**:\n\n📖 **Symptoms**: ${doc.symptoms ? doc.symptoms.join(', ') : doc.description}\n\n💊 **Chemical Treatment**: ${doc.chemicalDose || 'N/A'}\n\n🛡️ **Prevention**: ${doc.preventive || 'N/A'}`;
        } else if (doc.docType === 'faq') {
          reply = isGuj ? (doc.answer_gu || doc.answer) : doc.answer;
        } else if (doc.docType === 'crop') {
          reply = isGuj
            ? `**${doc.name_gu || doc.name}** ની માહિતી:\n\n🌱 **વાવણીનો સમય**: ${doc.Sowing_Time || 'માહિતી નથી'}\n\n📊 **ખાતર વ્યવસ્થાપન**: ${doc.Fertilizer_Recommendation || 'માહિતી નથી'}`
            : `Details for **${doc.name}**:\n\n🌱 **Sowing Time**: ${doc.Sowing_Time || 'N/A'}\n\n📊 **Fertilizer Recommendations**: ${doc.Fertilizer_Recommendation || 'N/A'}`;
        } else if (doc.docType === 'pest') {
          reply = isGuj
            ? `**${doc.name_gu || doc.name}** નિયંત્રણ:\n\n📖 **વિગતવાર માહિતી**: ${doc.Information || 'માહિતી નથી'}`
            : `Pest details for **${doc.name}**:\n\n📖 **Details**: ${doc.Information || 'N/A'}`;
        } else {
          reply = isGuj ? (doc.description_gu || doc.description) : doc.description;
        }
        reply += isGuj ? "\n\n*(માહિતી ઑફલાઇન શોધી કાઢવામાં આવી 💾)*" : "\n\n*(Information retrieved offline 💾)*";
      } 
      else if (score >= 1.0 && apiKey) {
        // Route B: Medium Confidence & Cloud Enabled -> Grounded Gemini API Response
        const docSummary = JSON.stringify(bestMatch.doc);
        reply = await this.callGeminiChat(text, docSummary);
      } 
      else {
        // Route C: Low Confidence / No API Key -> Fallback
        if (engineMode === 'gemini' && apiKey) {
          reply = await this.callGeminiChat(text);
        } else {
          await this._sleep(500);
          reply = ChatEngine.generateReply(text, this.currentResult);
        }
      }
    } catch (e) {
      console.error("Hybrid chat router error:", e);
      reply = ChatEngine.generateReply(text, this.currentResult);
    }

    this._hideTyping();
    this._appendBubble('bot', reply);
    this.chatHistory.push({ role: 'bot', text: reply });

    if (sendBtn) sendBtn.disabled = false;
  },

  _sendQuick(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) input.value = text;
    this._sendChat();
  },

  _showTyping() {
    const c = document.getElementById('ai-chat-messages');
    if (!c) return;
    const d = document.createElement('div');
    d.id = 'ai-typing-ind'; d.className = 'ai-chat-msg ai-msg-bot';
    d.innerHTML = `<div class="ai-chat-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="ai-chat-bubble ai-typing"><span></span><span></span><span></span></div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  },

  _hideTyping() { 
    document.getElementById('ai-typing-ind')?.remove(); 
  }
});
