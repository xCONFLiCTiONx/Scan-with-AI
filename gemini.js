// gemini.js

if (typeof window.GeminiAnalyzer === 'undefined') {
  window.GeminiAnalyzer = class GeminiAnalyzer {
    static get modelId() {
      return 'gemini-3.5-flash-lite';
    }

    static get modelName() {
      return 'Gemini 3.5 Flash Lite';
    }

    static get endpoint() {
      return `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent`;
    }

    static async analyze(aggregatedData) {
      const textToAnalyze = aggregatedData.rawEmail || aggregatedData.fullPageText || "";
      const isDistill = aggregatedData.smartDistill || false;
      const customPrompt = aggregatedData.customPrompt || "";
      const onProgress = aggregatedData.onProgress || (() => {});

      console.log("[GeminiAnalyzer] Preparing text analysis (length: " + textToAnalyze.length + ", Distill: " + isDistill + ")");

      const apiKey = await this._getApiKey();

      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please enter your API key in the popup.");
      }

      if (isDistill && textToAnalyze.length > 10000) {
        return this.analyzeWithDistillation(textToAnalyze, customPrompt, apiKey, onProgress);
      }

      let promptText = `Analyze the following content for details, context, key insights, or security threats if applicable:\n\n${textToAnalyze}`;

      if (customPrompt) {
        promptText = `User Instructions: ${customPrompt}\n\nContent to analyze:\n\n${textToAnalyze}`;
      }

      return this._fetchGemini(promptText, apiKey);
    }

    static async analyzeWithDistillation(text, customPrompt, apiKey, onProgress) {
      const chunkSize = 15000;
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
      }

      const interestingPoints = [];
      for (let i = 0; i < chunks.length; i++) {
        onProgress(`Scouting page: Part ${i + 1} of ${chunks.length}...`);
        const distillPrompt = `Extract only the most unique, interesting, or critical points from the following text chunk. Be concise. If there is nothing interesting, say "Nothing new".\n\nChunk ${i + 1}:\n${chunks[i]}`;

        try {
          const distillation = await this._fetchGemini(distillPrompt, apiKey);
          if (distillation && !distillation.toLowerCase().includes("nothing new")) {
            interestingPoints.push(distillation);
          }
        } catch (err) {
          console.warn(`[GeminiAnalyzer] Distillation error on chunk ${i+1}:`, err);
        }
      }

      onProgress("Synthesizing final analysis...");
      const finalPrompt = `The following are key points extracted from a large document. Based on these points ${customPrompt ? `and these instructions: "${customPrompt}"` : ""}, provide a comprehensive summary and analysis:\n\n${interestingPoints.join("\n\n")}`;

      return this._fetchGemini(finalPrompt, apiKey);
    }

    static async _getApiKey() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (syncResult) => {
          let key = syncResult?.gemini_api_key || syncResult?.geminiApiKey || syncResult?.apiKey;
          if (key) { resolve(key); return; }
          chrome.storage.local.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (localResult) => {
            key = localResult?.gemini_api_key || localResult?.geminiApiKey || localResult?.apiKey;
            resolve(key || '');
          });
        });
      });
    }

    static async _fetchGemini(promptText, apiKey) {
      try {
        const response = await fetch(`${this.endpoint}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const message = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
          throw new Error(`Gemini API Error: ${message}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
          throw new Error("Gemini returned an empty response or was blocked by safety filters.");
        }

        return candidate.content.parts[0].text;
      } catch (err) {
        throw err;
      }
    }
  };
}
