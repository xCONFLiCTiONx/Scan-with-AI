# Scan with AI (Gmail Security Analyzer)

An intelligent Chrome extension that leverages **Gemini 3.5 Flash Lite** to analyze web page content and Gmail messages for insights and security threats.

## 🚀 Overview

**Scan with AI** provides a suite of advanced analysis tools directly in your browser. Whether you're checking a suspicious email or summarizing a long article, the extension uses Google's latest AI models to provide context, key insights, and security assessments.

## ✨ Key Features

- **Gemini 3.5 Integration**: Uses `gemini-3.5-flash-lite` for fast, efficient, and intelligent text analysis.
- **Gmail Security Analyzer**:
  - **Phishing Detection**: Identifies high-pressure urgency and suspicious call-to-action phrases.
  - **Sender Analysis**: Evaluates sender metadata and domains for potential risks.
  - **Heuristic Scanning**: prunes email bodies to identify hidden threats.
- **Deep Scan Mode**: Programmatic "Scroll and Capture" feature to retrieve long-form content or virtualized conversation history.
- **In-Page Overlay**: Custom modal UI injected directly into pages for seamless chat sessions and analysis follow-ups.
- **Flexible Analysis**: Supports frontend (visible text) and backend (HTML source) scanning depths.
- **Privacy First**: Uses user-provided API keys stored securely in `chrome.storage.sync`.

## 🛠️ Setup & Installation

### Developer Mode
1. Download the extension folder.
2. Navigate to `chrome://extensions/` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder.

### Configuration
1. Open the extension **Options**.
2. Enter your **Google Gemini API Key**.
3. Click **Save**.

## 📖 Usage

### Web Pages
- Click the extension icon to open the popup.
- Select your scan depth and click **Scan Page**.
- Interact with the AI using the in-page overlay.

### Gmail
1. Open any email in Gmail.
2. Click the **🛡 Scan Email** button injected into the Gmail UI.
3. Review the security assessment and phishing risk score.

## 🛡️ Security Heuristics
- **DomainAnalyzer**: Evaluates TLDs and domain reputation.
- **EmailAnalyzer**: Detects social engineering patterns and suspicious language.

---
*Empowering your browser with advanced AI security.*
