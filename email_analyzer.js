if (typeof EmailAnalyzer === 'undefined') {
  var EmailAnalyzer = {
    analyze(emailData) {
      const result = {
        issues: [],
        riskScore: 0
      };

      const body = emailData.body.toLowerCase();
      
      if (body.includes("urgent") || body.includes("immediate action") || body.includes("suspended")) {
        result.issues.push("Contains high-pressure urgency keywords.");
        result.riskScore += 15;
      }

      if (body.includes("click here") || body.includes("verify your account") || body.includes("login now")) {
        result.issues.push("Contains typical phishing call-to-action phrases.");
        result.riskScore += 20;
      }

      return result;
    }
  };
}

if (typeof window !== "undefined") {
  window.EmailAnalyzer = EmailAnalyzer;
}