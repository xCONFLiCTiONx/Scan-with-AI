<img src="icons/icon48.png" width="48" align="left" style="margin-right: 15px;">

# Scan with AI

An intelligent Chrome extension that leverages **Gemini** to analyze web page content and Gmail messages for insights and security threats.

## 🚀 Overview

**Scan with AI** provides a suite of advanced analysis tools directly in your browser. Whether you're checking a suspicious email or summarizing a long article, the extension uses Google's latest AI models to provide context, key insights, and security assessments.

## ✨ Key Features

- **Gemini Integration**: Uses Google Gemini models for fast, efficient, and intelligent text analysis.
- **Gmail Security Analyzer**:
  - **Phishing Detection**: Identifies high-pressure urgency and suspicious call-to-action phrases.
  - **Sender Analysis**: Evaluates sender metadata and domains for potential risks.
  - **Heuristic Scanning**: Analyzes email bodies to identify hidden threats.
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
2. Enter your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
3. Click **Save**.

## 📖 Usage

### Web Pages
- Click the extension icon to open the popup.
- Select your scan depth and click **Scan Page**.
- Interact with the AI using the in-page overlay.

### Gmail
1. Open any email in Gmail and click on more button in the top right on the email then select Show original.
2. Click the **Scan Email** button injected into the Gmail UI.
3. Review the security assessment and phishing risk score.

## 🛡️ Security Heuristics
- **Domain Analyzer**: Evaluates TLDs and domain reputation.
- **Email Analyzer**: Detects social engineering patterns and suspicious language.

---
*Empowering your browser with advanced AI security.*
