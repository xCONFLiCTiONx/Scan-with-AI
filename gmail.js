// gmail.js

if (typeof window.GmailHelper === "undefined") {
  window.GmailHelper = class GmailHelper {
    static async getCurrentEmail() {
      return new Promise((resolve) => {
        console.log("[GmailHelper] Checking email content...");
        
        // Scrape visible content directly from the Gmail DOM as primary/fallback source
        const mainContainer = document.querySelector('div[role="main"]') || document.body;
        const domText = mainContainer ? mainContainer.innerText : "";

        chrome.runtime.sendMessage({ action: "fetch_gmail_api" }, (response) => {
          if (chrome.runtime.lastError || !response || !response.success || !response.data || !response.data.rawEmail || response.data.rawEmail.includes("Gmail API disabled")) {
            console.log("[GmailHelper] Using DOM scraped email text (Length: " + domText.length + ")");
            resolve({
              rawEmail: domText,
              fullPageText: domText
            });
            return;
          }

          console.log("[GmailHelper] Successfully fetched via Gmail API.");
          resolve({
            rawEmail: response.data.rawEmail,
            fullPageText: domText
          });
        });
      });
    }
  };
}