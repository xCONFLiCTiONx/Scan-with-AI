# Gmail Security Analyzer

## Install

1. Open Chrome and navigate to: `chrome://extensions`
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the extension folder.

---

## Setup

1. Open the extension **options**.
2. Enter your **Gemini API key**.
3. Click **Save**.

---

## Test

1. Open **Gmail**.
2. Open any email.
3. Look for the **🛡 Scan Email** button.
4. Click it.
5. Wait for the Gemini analysis.

---

## Features

* Gmail email scanning
* Gemini AI analysis
* Phishing detection
* Suspicious language detection
* Sender analysis
* URL checks
* Attachment checks

---

## Current Limitations

* Gmail API raw headers are not enabled yet.
* Full SPF/DKIM/DMARC extraction requires Gmail API OAuth.
* Current version analyzes visible email content.