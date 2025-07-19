import { state } from "../core/state.js";

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
    textArea.className = "sr-only"; // Use screen reader only class instead of inline styles
    textArea.value = text;
    textArea.style.cssText = "position: fixed; left: -999999px; top: -999999px;"; // Keep this as it's temporary
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
    feedback.className = `notification-base notification-right notification-copy ${
      type === "error" ? "error" : ""
    }`;
    feedback.textContent = message;

    document.body.appendChild(feedback);

    requestAnimationFrame(() => {
      feedback.classList.add("show");
    });

    setTimeout(() => {
      feedback.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          document.body.removeChild(feedback);
        }
      }, 300);
    }, 2000);
  },
};

export { DOMUtils };