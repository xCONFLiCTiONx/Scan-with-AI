# Implementation Plan - Gemini 3.5 Flash Lite Default & Deep Scan

Ensure the entire extension consistently defaults to **Gemini 3.5 Flash Lite** and implement a **Deep Scan** mode for high-fidelity analysis of long conversations.

## User Review Required

> [!IMPORTANT]
> **Consolidation**: I will remove redundant `GeminiAnalyzer` definitions (e.g., in `authentication_checker.js`) to ensure all features use the centralized, updated logic in `gemini.js`.
> **Deep Scan (Active Scroller)**: This mode will programmatically scroll up to capture virtualized content. It may take longer as it "captures" the conversation history, but it will provide a much more complete context for Gemini.

## Proposed Changes

### Configuration & Defaults
#### [MODIFY] [gemini.js](file:///C:/Users/Michael/Documents/Chrome/Scan with AI/gemini.js)
- Verify `gemini-3.5-flash-lite` is the immutable default `modelId`.
- Add a "Stitching" utility to merge conversation fragments.

#### [DELETE] Redundant code in [authentication_checker.js](file:///C:/Users/Michael/Documents/Chrome/Scan with AI/authentication_checker.js)
- Remove the local `GeminiAnalyzer` definition to ensure it uses the central one.

### Deep Scan Implementation
#### [MODIFY] [popup.html](file:///C:/Users/Michael/Documents/Chrome/Scan with AI/popup.html)
- Add a **"Deep Scan (Full History)"** checkbox.
- Update styling for better clarity.

#### [MODIFY] [popup.js](file:///C:/Users/Michael/Documents/Chrome/Scan with AI/popup.js)
- Implement `captureFullConversation()` which uses `chrome.scripting.executeScript` to perform a "Scroll and Capture" loop.
- Stitch captured blocks together, removing duplicates.

#### [MODIFY] [content.js](file:///C:/Users/Michael/Documents/Chrome/Scan with AI/content.js)
- Update the overlay UI to support the Deep Scan toggle.

## Verification Plan

### Automated Tests
- Verify that `gemini-3.5-flash-lite` is used in all outgoing fetch requests.
- Verify that the "Scroll and Capture" loop correctly identifies when no new content is loaded.

### Manual Verification
- Test on a long Gemini or ChatGPT conversation thread.
- Verify that the resulting analysis contains information from the very beginning of the thread, not just the currently visible part.
