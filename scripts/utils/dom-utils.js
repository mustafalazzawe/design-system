// dom-utils.js
import { state } from "../core/state.js";

// =============================================================================
// DOM Utility Functions
// =============================================================================

const DOMUtils = {
  // Main copy method with options
  copyToClipboard(text, options = {}) {
    const {
      customFeedback = null,
      showNotification = true,
      element = null,
      feedbackText = "Copied!",
      originalText = null,
      timeout = 2000
    } = options;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.handleCopySuccess(options);
        })
        .catch(() => this.fallbackCopy(text, options));
    } else {
      this.fallbackCopy(text, options);
    }
  },

  // Handle successful copy with appropriate feedback
  handleCopySuccess(options) {
    const {
      customFeedback,
      showNotification,
      element,
      feedbackText,
      originalText,
      timeout
    } = options;

    if (customFeedback) {
      customFeedback();
    } else if (element) {
      this.showElementFeedback(element, feedbackText, originalText, timeout);
    } else if (showNotification) {
      this.showFeedback(feedbackText);
    }
  },

  // Element-based feedback (for buttons)
  showElementFeedback(element, feedbackText = "Copied!", originalText = null, timeout = 2000) {
    // Store original text if not provided
    const original = originalText || element.textContent;
    
    // Clear any existing timeout to prevent stuck state
    if (element._copyTimeout) {
      clearTimeout(element._copyTimeout);
    }

    // Reset to original state first
    element.classList.remove("copied");
    element.textContent = original;
    element.offsetHeight; // Force reflow

    // Apply feedback state
    element.classList.add("copied");
    element.textContent = feedbackText;

    // Set new timeout
    element._copyTimeout = setTimeout(() => {
      element.textContent = original;
      element.classList.remove("copied");
      element._copyTimeout = null;
    }, timeout);
  },

  fallbackCopy(text, options = {}) {
    const textArea = document.createElement("textarea");
    textArea.className = "sr-only";
    textArea.value = text;
    textArea.style.cssText = "position: fixed; left: -999999px; top: -999999px;";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      this.handleCopySuccess(options);
    } catch (err) {
      console.error("Copy failed:", err);
      if (options.showNotification) {
        this.showFeedback("Copy failed", "error");
      }
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

  // Legacy method for backward compatibility
  copyWithNotification(text) {
    this.copyToClipboard(text, { showNotification: true });
  }
};

export { DOMUtils };