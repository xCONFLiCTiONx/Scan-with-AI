if (typeof DomainAnalyzer === 'undefined') {
  var DomainAnalyzer = {
    analyze(headers) {
      const result = {
        domain: "",
        displayName: "",
        issues: [],
        riskScore: 0
      };

      if (!headers.from) {
        result.issues.push("No sender address found.");
        result.riskScore += 20;
        return result;
      }

      result.displayName = this.getDisplayName(headers.from);
      result.domain = this.getDomain(headers.from);

      if (!result.domain) {
        result.issues.push("Unable to determine sender domain.");
        result.riskScore += 20;
        return result;
      }

      this.checkDomain(result);
      this.checkDisplayName(result);

      return result;
    },

    getDomain(value) {
      const match = value.match(/@([^\s>]+)/i);
      if (!match) return "";
      return match[1].replace(">", "").toLowerCase();
    },

    getDisplayName(value) {
      const match = value.match(/^"?([^"<]+)"?\s*</);
      if (match) return match[1].trim();
      return "";
    },

    checkDomain(result) {
      const domain = result.domain;
      if (domain.includes("-")) {
        result.issues.push("Domain contains hyphens that may indicate a look-alike domain.");
        result.riskScore += 5;
      }

      const suspiciousTlds = [".xyz", ".top", ".click", ".live", ".work", ".support"];
      for (const tld of suspiciousTlds) {
        if (domain.endsWith(tld)) {
          result.issues.push("Suspicious domain extension: " + tld);
          result.riskScore += 15;
        }
      }
    },

    checkDisplayName(result) {
      const name = result.displayName.toLowerCase();
      const trustedNames = ["paypal", "microsoft", "google", "amazon", "apple", "facebook", "instagram", "netflix", "bank", "security", "support", "billing", "verification"];

      for (const word of trustedNames) {
        if (name.includes(word)) {
          if (!result.domain.includes(word)) {
            result.issues.push("Sender name suggests " + word + " but domain does not match.");
            result.riskScore += 35;
          }
        }
      }
    }
  };
}

if (typeof window !== "undefined") {
  window.DomainAnalyzer = DomainAnalyzer;
}