import { state } from "./state.js";
import { themeManager } from "./theme-manager.js";
import { ColorUtils } from "../utils/color-utils.js";
import { DOMUtils } from "../utils/dom-utils.js";

// =============================================================================
// Rendering System
// =============================================================================

class Renderer {
  constructor() {
    this.isRendering = false;
  }

  // =============================================================================
  // HELPERS
  // =============================================================================

  getContrastTextColor(backgroundHex) {
    const isLight = ColorUtils.isLightColor(backgroundHex);
    return isLight
      ? state.neutralColors[950]?.hex || "#18181b" // Dark text on light background
      : state.neutralColors[50]?.hex || "#fafafa"; // Light text on dark background
  }

  // =============================================================================
  // PAGE METADATA UPDATES
  // =============================================================================

  updatePageMetadata() {
    if (!state.currentColorSystem) {
      console.warn("Renderer: Cannot update metadata - no color system");
      return;
    }

    const titleElement = document.querySelector("h1");
    const subtitleElement = document.querySelector(".subtitle");
    const neutralTitle = document.getElementById("neutral-section-title");
    const primaryTitle = document.getElementById("primary-section-title");

    if (titleElement) {
      titleElement.textContent =
        state.currentColorSystem.config.project?.name ||
        "Semantic Color Design System";
    }

    if (subtitleElement) {
      subtitleElement.textContent =
        state.currentColorSystem.config.project?.description ||
        "A comprehensive color system built on primitive colors with semantic tokens for consistent, accessible design";
    }

    if (neutralTitle) {
      const neutralName = state.getCurrentNeutralName();
      neutralTitle.textContent =
        neutralName.charAt(0).toUpperCase() + neutralName.slice(1);
    }

    if (primaryTitle) {
      const primaryName = state.getCurrentPrimaryName();
      primaryTitle.textContent =
        primaryName.charAt(0).toUpperCase() + primaryName.slice(1);
    }
  }

  // =============================================================================
  // PRIMITIVE COLOR CARD CREATION
  // =============================================================================

  createPrimitiveCard(hex, name, colorFamily) {
    const textColor = this.getContrastTextColor(hex);
    const contrast = state.getContrastInfo(hex, colorFamily);
    const isMainColorCard = state.isMainColor(hex, colorFamily);

    // Find best family contrast match
    let bestFamilyMatch = null;
    for (const [shade, info] of Object.entries(contrast.family)) {
      if (info.aa && (!bestFamilyMatch || info.ratio > bestFamilyMatch.ratio)) {
        bestFamilyMatch = { shade: `${colorFamily}-${shade}`, ...info };
      }
    }

    const card = document.createElement("div");
    card.className = "primitive-card";

    const mainColorIndicator = isMainColorCard
      ? '<div class="user-selected-indicator"></div>'
      : "";

    card.innerHTML = `
      <div class="primitive-swatch" style="background-color: ${hex}; color: ${textColor};">
        <button class="copy-btn interactive-base">Copy</button>
        ${mainColorIndicator}
      </div>
      <div class="primitive-info">
        <div class="primitive-name">${name}</div>
        <div class="primitive-value">${hex.toUpperCase()}</div>
        <div class="contrast-info">
          ${
            contrast.aaWhite
              ? '<span class="contrast-badge aa-pass">AA White</span>'
              : ""
          }
          ${
            contrast.aaBlack
              ? '<span class="contrast-badge aa-pass">AA Black</span>'
              : ""
          }
          ${
            contrast.aaaWhite
              ? '<span class="contrast-badge aaa-pass">AAA White</span>'
              : ""
          }
          ${
            contrast.aaaBlack
              ? '<span class="contrast-badge aaa-pass">AAA Black</span>'
              : ""
          }
          ${
            bestFamilyMatch
              ? `<span class="contrast-badge family-pass">${bestFamilyMatch.shade.toUpperCase()}</span>`
              : ""
          }
        </div>
      </div>
    `;

    // Add event listeners
    this.attachCardEventListeners(card, hex);

    return card;
  }

  attachCardEventListeners(card, hex) {
    const swatch = card.querySelector(".primitive-swatch");
    const copyBtn = card.querySelector(".copy-btn");

    if (swatch) {
      swatch.addEventListener("click", () => DOMUtils.copyToClipboard(hex));
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        DOMUtils.copyToClipboard(hex);
      });
    }
  }

  // =============================================================================
  // PRIMITIVE GRID RENDERING
  // =============================================================================

  renderPrimitiveGrid(colors, containerId, colorFamily) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Renderer: Container ${containerId} not found`);
      return;
    }

    if (!colors || typeof colors !== "object") {
      console.warn(`Renderer: Invalid colors data for ${containerId}`);
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Create and append cards
    Object.entries(colors).forEach(([weight, color]) => {
      if (color && color.hex && color.name) {
        const card = this.createPrimitiveCard(
          color.hex,
          color.name,
          colorFamily
        );
        container.appendChild(card);
      }
    });

    console.log(
      `🎨 Rendered ${Object.keys(colors).length} ${colorFamily} colors`
    );
  }

  // =============================================================================
  // SEMANTIC TOKEN UPDATES
  // =============================================================================

  updateSemanticTokens() {
    const currentTheme = themeManager.getCurrentTheme();

    if (
      !state.semanticTokens ||
      Object.keys(state.semanticTokens).length === 0
    ) {
      console.warn("Renderer: No semantic tokens to update");
      return;
    }

    let updateCount = 0;

    Object.keys(state.semanticTokens).forEach((tokenName) => {
      const preview = document.getElementById(`${tokenName}-preview`);
      if (preview) {
        const token = state.semanticTokens[tokenName][currentTheme];
        if (token) {
          preview.textContent = token.name;
          this.styleSemanticPreview(preview, token);
          this.attachSemanticPreviewListener(preview, token.hex);
          updateCount++;
        }
      }
    });

    console.log(`🎨 Updated ${updateCount} semantic token previews`);
  }

  styleSemanticPreview(preview, token) {
    // Remove any existing dynamic classes
    preview.classList.remove(
      "color-preview-light",
      "color-preview-dark",
      "color-preview-alpha"
    );

    if (token.hex.includes("rgba") || token.hex === "transparent") {
      preview.classList.add("color-preview-alpha");
      preview.style.setProperty("--dynamic-bg", token.hex);
    } else {
      const isLight = ColorUtils.isLightColor(token.hex);
      preview.classList.add(
        isLight ? "color-preview-light" : "color-preview-dark"
      );

      // Set dynamic colors via CSS custom properties
      preview.style.setProperty("--dynamic-bg", token.hex);

      // Always set contrast text color for better reliability
      const contrastTextColor = this.getContrastTextColor(token.hex);
      preview.style.setProperty("--dynamic-text", contrastTextColor);
    }
  }

  attachSemanticPreviewListener(preview, hex) {
    // Remove existing listener to avoid duplicates
    preview.onclick = null;
    preview.onclick = () => DOMUtils.copyToClipboard(hex);
  }

  updateStatusDemos(theme) {
    const statusDemos = [
      {
        id: "success-demo",
        bg: "success-background",
        fg: "success-foreground",
      },
      {
        id: "warning-demo",
        bg: "warning-background",
        fg: "warning-foreground",
      },
      {
        id: "error-demo",
        bg: "error-background",
        fg: "error-foreground",
      },
    ];

    statusDemos.forEach(({ id, bg, fg }) => {
      const demo = document.getElementById(id);
      if (demo && state.semanticTokens[bg] && state.semanticTokens[fg]) {
        demo.style.backgroundColor = state.semanticTokens[bg][theme].hex;
        demo.style.color = state.semanticTokens[fg][theme].hex;
      }
    });
  }

  // =============================================================================
  // DEMO COMPONENT UPDATES
  // =============================================================================

  updateDemoComponents() {
    const currentTheme = themeManager.getCurrentTheme();

    // Update demo text elements
    this.updateDemoTextElements();

    // Update semantic badges
    this.updateSemanticBadges(currentTheme);

    // Update status demos
    this.updateStatusDemos(currentTheme);

    // Update text field styling
    this.updateTextFieldStyling();

    console.log("🎨 Demo components updated");
  }

  updateDemoTextElements() {
    const elements = [
      { selector: ".demo-heading", className: "demo-text-primary" },
      { selector: ".demo-subheading", className: "demo-text-secondary" },
      { selector: ".demo-body", className: "demo-text-tertiary" },
      { selector: ".demo-caption", className: "demo-text-quaternary" },
    ];

    elements.forEach(({ selector, className }) => {
      const element = document.querySelector(selector);
      if (element) {
        // Remove any existing demo text classes
        element.classList.remove(
          "demo-text-primary",
          "demo-text-secondary",
          "demo-text-tertiary",
          "demo-text-quaternary"
        );
        // Add the appropriate class
        element.classList.add(className);
      }
    });
  }

  updateSemanticBadges(theme) {
    const semanticBadges = document.querySelectorAll(".semantic-badge");
    if (
      semanticBadges.length > 0 &&
      state.semanticTokens["success-background"] &&
      state.semanticTokens["success-foreground"]
    ) {
      const successBg = state.semanticTokens["success-background"][theme].hex;
      const successFg = state.semanticTokens["success-foreground"][theme].hex;

      semanticBadges.forEach((badge) => {
        badge.style.backgroundColor = successBg;
        badge.style.color = successFg;
      });
    }
  }

  updateTextFieldStyling() {
    const textFields = document.querySelectorAll(".text-field");

    textFields.forEach((field) => {
      // Remove any existing state classes
      field.classList.remove(
        "text-field-success-active",
        "text-field-error-active"
      );

      // Clear any inline styles
      field.style.borderColor = "";
      field.style.boxShadow = "";

      // Add appropriate CSS classes
      if (field.classList.contains("success")) {
        field.classList.add("text-field-success-active");
      } else if (field.classList.contains("error")) {
        field.classList.add("text-field-error-active");
      }
    });
  }

  // =============================================================================
  // MAIN RENDER METHOD
  // =============================================================================

  renderInterface() {
    if (this.isRendering) {
      console.warn("Renderer: Already rendering, skipping");
      return;
    }

    if (!state.isInitialized()) {
      console.error("Renderer: Cannot render - state not initialized");
      return;
    }

    this.isRendering = true;

    try {
      console.log("🎨 Starting interface render...");

      // Update page metadata
      this.updatePageMetadata();

      // Render primitive color grids
      this.renderPrimitiveGrid(
        state.neutralColors,
        "neutral-grid",
        state.getCurrentNeutralName()
      );

      this.renderPrimitiveGrid(
        state.primaryColors,
        "primary-grid",
        state.getCurrentPrimaryName()
      );

      // Update semantic tokens
      this.updateSemanticTokens();

      // Update demo components
      this.updateDemoComponents();

      console.log("✅ Interface render complete");
    } catch (error) {
      console.error("❌ Renderer error:", error);
    } finally {
      this.isRendering = false;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Force a complete re-render
  forceRender() {
    console.log("🔄 Forcing complete re-render...");
    this.isRendering = false; // Reset flag
    this.renderInterface();
  }

  // Check if renderer is ready
  isReady() {
    return state.isInitialized() && !this.isRendering;
  }

  // Get render statistics
  getRenderStats() {
    return {
      ready: this.isReady(),
      rendering: this.isRendering,
      hasColorSystem: !!state.currentColorSystem,
      neutralCount: Object.keys(state.neutralColors).length,
      primaryCount: Object.keys(state.primaryColors).length,
      semanticCount: Object.keys(state.semanticTokens).length,
    };
  }
}

export const renderer = new Renderer();
