/**
 * KrishiAI Intelligent Client-Side Search Engine
 * Implement BM25 / TF-IDF Vector Space Model, Levenshtein Fuzzy Search,
 * and Bilingual (English/Gujarati) Synonym Query Expansion.
 */

const SearchEngine = {
  // Common agricultural synonyms mapping for Gujarat farming
  SYNONYMS: {
    "wilt": ["wilt", "sukaro", "suko", "સુકારો"],
    "sukaro": ["wilt", "sukaro", "suko", "સુકારો"],
    "cotton": ["cotton", "kapas", "કપાસ"],
    "kapas": ["cotton", "kapas", "કપાસ"],
    "wheat": ["wheat", "ghau", "ghaum", "ઘઉં"],
    "ghau": ["wheat", "ghau", "ghaum", "ઘઉં"],
    "groundnut": ["groundnut", "peanut", "magfali", "મગફળી"],
    "magfali": ["groundnut", "peanut", "magfali", "મગફળી"],
    "rice": ["rice", "paddy", "danger", "ડાંગર"],
    "paddy": ["rice", "paddy", "danger", "ડાંગર"],
    "danger": ["rice", "paddy", "danger", "ડાંગર"],
    "rust": ["rust", "geru", "ગેરુ", "કટ"],
    "geru": ["rust", "geru", "ગેરુ"],
    "blight": ["blight", "zukha", "ઝાળ"],
    "pest": ["pest", "iyad", "caterpillar", "જીવાત", "ઈયળ"],
    "iyad": ["pest", "iyad", "caterpillar", "જીવાત", "ઈયળ"],
    "rot": ["rot", "kohvaro", "સળો"],
    "kohvaro": ["rot", "kohvaro", "સળો"]
  },

  // Stop words to clean tokens
  STOP_WORDS: new Set([
    "a", "an", "the", "and", "or", "but", "if", "then", "of", "at", "by", "for", "with", "about",
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
    "did", "to", "from", "in", "on", "not", "this", "that", "these", "those",
    "હું", "તે", "તેઓ", "છે", "હતા", "અને", "અથવા", "માટે", "થી", "દ્વારા", "પર", "માં"
  ]),

  /**
   * Calculates the Levenshtein distance between two strings.
   * Used for typo correction and fuzzy matches.
   */
  levenshtein(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const m = s1.length, n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,    // Deletion
            dp[i][j - 1] + 1,    // Insertion
            dp[i - 1][j - 1] + 1 // Substitution
          );
        }
      }
    }
    return dp[m][n];
  },

  /**
   * Tokenizes and cleans a text string.
   */
  tokenize(text) {
    if (!text) return [];
    // Split by spaces, punctuation, and non-alphanumeric (except Gujarati chars)
    const rawTokens = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
      .split(/\s+/);
      
    return rawTokens
      .map(t => t.trim())
      .filter(t => t.length > 0 && !this.STOP_WORDS.has(t));
  },

  /**
   * Expands query tokens using the synonym dictionary.
   */
  expandQuery(tokens) {
    const expanded = new Set(tokens);
    for (const token of tokens) {
      if (this.SYNONYMS[token]) {
        for (const syn of this.SYNONYMS[token]) {
          expanded.add(syn);
        }
      }
    }
    return Array.from(expanded);
  },

  /**
   * Searches a document collection using BM25-like scoring.
   * @param {string} queryText - User's search query.
   * @param {Array<Object>} docs - Array of documents to search.
   * @param {Array<string>} fields - Document fields to match against.
   */
  search(queryText, docs, fields = ["name", "namegu", "description", "symptoms", "question", "answer"]) {
    if (!queryText || !docs || docs.length === 0) return [];

    let queryTokens = this.tokenize(queryText);
    queryTokens = this.expandQuery(queryTokens);

    if (queryTokens.length === 0) return [];

    // Constants for BM25
    const k1 = 1.2;
    const b = 0.75;

    // Calculate document lengths and average length
    const docTexts = docs.map(doc => {
      let text = "";
      for (const field of fields) {
        const val = doc[field];
        if (typeof val === "string") {
          text += " " + val;
        } else if (Array.isArray(val)) {
          text += " " + val.join(" ");
        } else if (typeof val === "object" && val !== null) {
          text += " " + JSON.stringify(val);
        }
      }
      return text;
    });

    const docLengths = docTexts.map(t => this.tokenize(t).length);
    const avgDocLength = docLengths.reduce((sum, len) => sum + len, 0) / docs.length || 1;

    // Calculate Document Frequency (DF) for each query token
    const df = {};
    for (const token of queryTokens) {
      df[token] = 0;
      for (let i = 0; i < docs.length; i++) {
        const docTokens = new Set(this.tokenize(docTexts[i]));
        if (docTokens.has(token)) {
          df[token]++;
        } else {
          // Perform Levenshtein fuzzy checking for short term mismatches (e.g. typos)
          for (const dt of docTokens) {
            if (dt.length > 3 && token.length > 3 && this.levenshtein(dt, token) <= 1) {
              df[token]++;
              break;
            }
          }
        }
      }
    }

    const results = [];

    // Score each document
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const docTokens = this.tokenize(docTexts[i]);
      
      // Calculate token frequencies in this doc
      const tf = {};
      for (const t of docTokens) {
        tf[t] = (tf[t] || 0) + 1;
      }

      let score = 0;

      for (const token of queryTokens) {
        // Find exact or fuzzy matches in tf
        let termFrequency = tf[token] || 0;
        if (termFrequency === 0) {
          // Fuzzy lookup
          for (const t of Object.keys(tf)) {
            if (t.length > 3 && token.length > 3 && this.levenshtein(t, token) <= 1) {
              termFrequency = tf[t];
              break;
            }
          }
        }

        if (termFrequency === 0) continue;

        // Inverse Document Frequency (IDF)
        const docCount = docs.length;
        const documentFreq = df[token] || 0;
        const idf = Math.log((docCount - documentFreq + 0.5) / (documentFreq + 0.5) + 1);

        // BM25 term weighting formula
        const docLength = docLengths[i];
        const tfNumerator = termFrequency * (k1 + 1);
        const tfDenominator = termFrequency + k1 * (1 - b + b * (docLength / avgDocLength));
        
        score += idf * (tfNumerator / tfDenominator);
      }

      // Boost scores if matches are found in prioritized fields (e.g., name / title)
      let boost = 1.0;
      const lowerQuery = queryText.toLowerCase();
      
      if (doc.name && doc.name.toLowerCase().includes(lowerQuery)) boost += 0.5;
      if (doc.namegu && doc.namegu.toLowerCase().includes(lowerQuery)) boost += 0.5;
      if (doc.question && doc.question.toLowerCase().includes(lowerQuery)) boost += 0.5;

      const finalScore = score * boost;

      if (finalScore > 0) {
        results.push({
          doc,
          score: finalScore
        });
      }
    }

    // Sort by descending score
    results.sort((a, b) => b.score - a.score);
    return results;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}
