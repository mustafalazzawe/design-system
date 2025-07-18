import { state } from '../core/state.js';

// =============================================================================
// DOM Utility Functions
// =============================================================================

const DOMUtils = {
  copyToClipboard(text, customFeedback = null) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (customFeedback) {
            customFeedback();
          } else {
            this.showFeedback("Copied!");
          }
        })
        .catch(() => this.fallbackCopy(text, customFeedback));
    } else {
      this.fallbackCopy(text, customFeedback);
    }
  },

  fallbackCopy(text, customFeedback = null) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText =
      "position: fixed; left: -999999px; top: -999999px;";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      if (customFeedback) {
        customFeedback();
      } else {
        this.showFeedback("Copied!");
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }

    document.body.removeChild(textArea);
  },

  showFeedback(message = "Copied!", type = "success") {
    const feedback = document.createElement("div");
    feedback.textContent = message;

    const color =
      type === "success"
        ? state?.semanticTokens?.["success-foreground"]?.light?.hex || "#10b981"
        : "#dc2626";

    feedback.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${color}; color: white; padding: 12px 16px;
      border-radius: 8px; font-family: 'Rubik', sans-serif;
      font-size: 0.9rem; font-weight: 500; pointer-events: none;
      opacity: 0; transition: all 0.3s ease; transform: translateY(-10px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(feedback);

    requestAnimationFrame(() => {
      feedback.style.opacity = "1";
      feedback.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      feedback.style.opacity = "0";
      feedback.style.transform = "translateY(-10px)";
      setTimeout(() => document.body.removeChild(feedback), 300);
    }, 2000);
  },
};

export { DOMUtils };