import { state } from "../core/state.js";
import { codeGenerators } from "./generators.js";
import { DOMUtils } from "../utils/dom-utils.js";

// =============================================================================
// Enhanced Export Manager - Main Export UI System
// =============================================================================

class EnhancedExportManager {
  constructor() {
    this.state = {
      currentTab: "css",
      currentFormat: "hex",
      includeMedia: false,
      includeThemes: true,
      textWrapEnabled: false,
    };
    this.modal = null;
    this.copyFeedbackTimeouts = {};
    this.originalCopyTexts = {};
    this.init();
  }

  init() {
    this.modal = document.getElementById("exportModal");
    if (!this.modal) {
      console.warn("Export Manager: Export modal not found");
      return;
    }
    this.bindEvents();
  }

  // =============================================================================
  // CODE GENERATION METHODS
  // =============================================================================

  generateCSS() {
    return codeGenerators.generateCSS({
      format: this.state.currentFormat,
      includeMedia: this.state.includeMedia,
      includeThemes: this.state.includeThemes,
    });
  }

  generateTailwindConfig() {
    return codeGenerators.generateTailwindConfig({
      format: this.state.currentFormat,
    });
  }

  generateTailwindCSS() {
    return codeGenerators.generateTailwindCSS({
      format: this.state.currentFormat,
      includeThemes: this.state.includeThemes,
    });
  }

  generateJSON() {
    return codeGenerators.generateJSON({
      format: this.state.currentFormat,
      includeThemes: this.state.includeThemes,
    });
  }

  // =============================================================================
  // UI UPDATE METHODS
  // =============================================================================

  updateCodePreview() {
    const cssCode = document.getElementById("css-code");
    const tailwindConfigCode = document.getElementById("tailwind-config-code");
    const tailwindCssCode = document.getElementById("tailwind-css-code");
    const jsonCode = document.getElementById("json-code");

    try {
      if (cssCode) cssCode.textContent = this.generateCSS();
      if (tailwindConfigCode)
        tailwindConfigCode.textContent = this.generateTailwindConfig();
      if (tailwindCssCode)
        tailwindCssCode.textContent = this.generateTailwindCSS();
      if (jsonCode) jsonCode.textContent = this.generateJSON();
    } catch (error) {
      console.error("Export Manager: Error updating code preview:", error);
    }
  }

  forceScrollRecalculation() {
    const activeCodeContent = document.querySelector(".code-content");
    if (activeCodeContent) {
      // Force the browser to recalculate scrollable area
      const originalOverflow = activeCodeContent.style.overflow;
      activeCodeContent.style.overflow = "hidden";

      // Trigger reflow
      activeCodeContent.offsetHeight;

      // Restore overflow
      activeCodeContent.style.overflow = originalOverflow || "auto";
    }
  }

  // =============================================================================
  // TAB AND FORMAT MANAGEMENT
  // =============================================================================

  switchTab(tab) {
    this.state.currentTab = tab;

    // Update tab buttons
    document
      .querySelectorAll(".export-modal .tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    const tabButton = document.getElementById(`${tab}-tab`);
    if (tabButton) tabButton.classList.add("active");

    const container = document.querySelector(".code-preview-container");
    if (!container) return;

    // Hide ALL sections first
    const allSections = [
      "css-section",
      "json-section",
      "tailwind-config-section",
      "tailwind-css-section",
    ];

    allSections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.classList.add("hidden");
        element.style.display = "none";
      }
    });

    if (tab === "tailwind") {
      // Show split layout for Tailwind
      container.classList.add("split");
      // Show Tailwind sections
      const configSection = document.getElementById("tailwind-config-section");
      const cssSection = document.getElementById("tailwind-css-section");
      if (configSection) {
        configSection.classList.remove("hidden");
        configSection.style.display = "flex";
      }
      if (cssSection) {
        cssSection.classList.remove("hidden");
        cssSection.style.display = "flex";
      }
    } else {
      // Show single layout
      container.classList.remove("split");
      // Show the selected section
      const selectedSection = document.getElementById(`${tab}-section`);
      if (selectedSection) {
        selectedSection.classList.remove("hidden");
        selectedSection.style.display = "flex";
      }
    }

    // Show/hide @media toggle only for CSS tab
    const mediaContainer = document.getElementById("media-toggle-container");
    if (mediaContainer) {
      if (tab === "css" && this.state.includeThemes) {
        mediaContainer.style.display = "flex";
      } else {
        mediaContainer.style.display = "none";
      }
    }

    // Force scroll recalculation after tab switch
    setTimeout(() => {
      this.forceScrollRecalculation();
    }, 10);
  }

  setFormat(format) {
    this.state.currentFormat = format;

    // Update ONLY color format buttons, not the wrap button
    document
      .querySelectorAll(".format-buttons .format-button")
      .forEach((btn) => btn.classList.remove("active"));
    const formatButton = document.getElementById(`${format}-btn`);
    if (formatButton) formatButton.classList.add("active");

    this.updateCodePreview();
  }

  // =============================================================================
  // TOGGLE FUNCTIONS
  // =============================================================================

  toggleTextWrap() {
    this.state.textWrapEnabled = !this.state.textWrapEnabled;

    // Update button appearance
    const wrapButton = document.getElementById("wrap-btn");
    if (wrapButton) {
      wrapButton.classList.toggle("active", this.state.textWrapEnabled);
    }

    // Apply wrap/no-wrap styling to code blocks
    const codeBlocks = document.querySelectorAll(".code-block");
    codeBlocks.forEach((block) => {
      if (this.state.textWrapEnabled) {
        block.classList.remove("force-scroll");
      } else {
        block.classList.add("force-scroll");
      }
    });
  }

  toggleMedia() {
    this.state.includeMedia = !this.state.includeMedia;
    const toggle = document.getElementById("media-toggle");
    if (toggle) {
      toggle.classList.toggle("active", this.state.includeMedia);
    }
    this.updateCodePreview();
  }

  toggleThemes() {
    this.state.includeThemes = !this.state.includeThemes;
    const toggle = document.getElementById("themes-toggle");
    if (toggle) {
      toggle.classList.toggle("active", this.state.includeThemes);
    }

    // Show/hide @media toggle based on themes setting AND current tab
    const mediaContainer = document.getElementById("media-toggle-container");
    if (mediaContainer) {
      if (this.state.includeThemes && this.state.currentTab === "css") {
        mediaContainer.style.display = "flex";
      } else {
        mediaContainer.style.display = "none";
        // Reset @media toggle when themes are disabled
        this.state.includeMedia = false;
        const mediaToggle = document.getElementById("media-toggle");
        if (mediaToggle) mediaToggle.classList.remove("active");
      }
    }

    this.updateCodePreview();
  }

  // =============================================================================
  // MODAL MANAGEMENT
  // =============================================================================

  open() {
    if (!this.modal) {
      console.warn("Export Manager: Modal not available");
      return;
    }

    this.modal.classList.add("show");

    // Initialize wrap button state
    const wrapButton = document.getElementById("wrap-btn");
    if (wrapButton) {
      wrapButton.classList.toggle("active", this.state.textWrapEnabled);
    }

    // Apply initial text wrap state to code blocks
    const codeBlocks = document.querySelectorAll(".code-block");
    codeBlocks.forEach((block) => {
      if (this.state.textWrapEnabled) {
        block.classList.remove("force-scroll");
      } else {
        block.classList.add("force-scroll");
      }
    });

    // Initialize @media toggle visibility
    const mediaContainer = document.getElementById("media-toggle-container");
    if (mediaContainer) {
      if (this.state.currentTab === "css" && this.state.includeThemes) {
        mediaContainer.style.display = "flex";
      } else {
        mediaContainer.style.display = "none";
      }
    }

    // Update content first
    this.updateCodePreview();

    // Force proper initial state by explicitly calling switchTab
    setTimeout(() => {
      this.switchTab(this.state.currentTab);

      // Additional force scroll recalculation
      setTimeout(() => {
        this.forceScrollRecalculation();
      }, 50);
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    console.log("📤 Export modal opened");
  }

  close() {
    if (!this.modal) return;

    this.modal.classList.remove("show");

    // Restore body scroll
    document.body.style.overflow = "";

    console.log("📤 Export modal closed");
  }

  // =============================================================================
  // COPY FUNCTIONALITY
  // =============================================================================

  copyCode(format) {
    let text = "";

    try {
      switch (format) {
        case "css":
          text = this.generateCSS();
          break;
        case "tailwind-config":
          text = this.generateTailwindConfig();
          break;
        case "tailwind-css":
          text = this.generateTailwindCSS();
          break;
        case "json":
          text = this.generateJSON();
          break;
        default:
          console.warn(`Export Manager: Unknown format: ${format}`);
          return;
      }

      DOMUtils.copyToClipboard(text, () => this.showCopyFeedback(format));
    } catch (error) {
      console.error("Export Manager: Error copying code:", error);
      DOMUtils.showFeedback("Copy failed", "error");
    }
  }

  showCopyFeedback(format) {
    const button = document.getElementById(`${format}-copy`);
    if (!button) return;

    // Clear any existing timeout to prevent stuck state
    if (this.copyFeedbackTimeouts[format]) {
      clearTimeout(this.copyFeedbackTimeouts[format]);
    }

    // Store original text if we don't have it yet
    if (!this.originalCopyTexts[format]) {
      this.originalCopyTexts[format] = button.textContent;
    }

    const originalText = this.originalCopyTexts[format];

    // Reset to original state first
    button.classList.remove("copied");
    button.textContent = originalText;
    button.offsetHeight; // Force reflow

    // Apply feedback state
    button.classList.add("copied");
    button.textContent = "Copied!";

    // Set new timeout
    this.copyFeedbackTimeouts[format] = setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
      this.copyFeedbackTimeouts[format] = null;
    }, 2000);
  }

  // =============================================================================
  // EVENT BINDING
  // =============================================================================

  bindEvents() {
    if (!this.modal) return;

    // Close modal on outside click
    this.modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.close();
      }
    });

    // Prevent click-through on modal content
    const modalContent = this.modal.querySelector(".export-modal");
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("show")) {
        this.close();
      }
    });

    // Bind export tab buttons
    document
      .getElementById("css-tab")
      ?.addEventListener("click", () => this.switchTab("css"));
    document
      .getElementById("tailwind-tab")
      ?.addEventListener("click", () => this.switchTab("tailwind"));
    document
      .getElementById("json-tab")
      ?.addEventListener("click", () => this.switchTab("json"));

    // Bind format buttons
    document
      .getElementById("hex-btn")
      ?.addEventListener("click", () => this.setFormat("hex"));
    document
      .getElementById("rgb-btn")
      ?.addEventListener("click", () => this.setFormat("rgb"));
    document
      .getElementById("hsl-btn")
      ?.addEventListener("click", () => this.setFormat("hsl"));

    // Bind toggle buttons
    document
      .getElementById("wrap-btn")
      ?.addEventListener("click", () => this.toggleTextWrap());
    document
      .getElementById("media-toggle")
      ?.addEventListener("click", () => this.toggleMedia());
    document
      .getElementById("themes-toggle")
      ?.addEventListener("click", () => this.toggleThemes());

    // Bind copy buttons
    document
      .getElementById("css-copy")
      ?.addEventListener("click", () => this.copyCode("css"));
    document
      .getElementById("tailwind-config-copy")
      ?.addEventListener("click", () => this.copyCode("tailwind-config"));
    document
      .getElementById("tailwind-css-copy")
      ?.addEventListener("click", () => this.copyCode("tailwind-css"));
    document
      .getElementById("json-copy")
      ?.addEventListener("click", () => this.copyCode("json"));

    console.log("📤 Export manager events bound");
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Get current export state
  getExportState() {
    return {
      ...this.state,
      isOpen: this.modal?.classList.contains("show") || false,
    };
  }

  // Reset to default state
  reset() {
    this.state = {
      currentTab: "css",
      currentFormat: "hex",
      includeMedia: false,
      includeThemes: true,
      textWrapEnabled: false,
    };

    // Update UI elements to match reset state
    this.updateUIFromState();
  }

  // Update UI elements from current state
  updateUIFromState() {
    // Update format buttons
    document
      .querySelectorAll(".format-buttons .format-button")
      .forEach((btn) => btn.classList.remove("active"));
    const formatButton = document.getElementById(
      `${this.state.currentFormat}-btn`
    );
    if (formatButton) formatButton.classList.add("active");

    // Update toggles
    const wrapButton = document.getElementById("wrap-btn");
    if (wrapButton) {
      wrapButton.classList.toggle("active", this.state.textWrapEnabled);
    }

    const mediaToggle = document.getElementById("media-toggle");
    if (mediaToggle) {
      mediaToggle.classList.toggle("active", this.state.includeMedia);
    }

    const themesToggle = document.getElementById("themes-toggle");
    if (themesToggle) {
      themesToggle.classList.toggle("active", this.state.includeThemes);
    }
  }

  // Cleanup method
  cleanup() {
    // Clear any pending timeouts
    Object.values(this.copyFeedbackTimeouts).forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    this.copyFeedbackTimeouts = {};

    // Restore body scroll if modal was open
    if (this.modal?.classList.contains("show")) {
      document.body.style.overflow = "";
    }
  }

  // Validation method
  validateForExport() {
    const issues = codeGenerators.validateState();
    if (issues.length > 0) {
      console.warn("Export validation issues:", issues);
      return false;
    }
    return true;
  }
}

const exportManager = new EnhancedExportManager();

export const openEnhancedExportModal = () => exportManager.open();
export const closeEnhancedExportModal = () => exportManager.close();
export const exportSwitchTab = (tab) => exportManager.switchTab(tab);
export const setFormat = (format) => exportManager.setFormat(format);
export const toggleTextWrap = () => exportManager.toggleTextWrap();
export const toggleMedia = () => exportManager.toggleMedia();
export const toggleThemes = () => exportManager.toggleThemes();
export const copyCode = (format) => exportManager.copyCode(format);

export { exportManager };
