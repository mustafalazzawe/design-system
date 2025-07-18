import { state } from './state.js';
import { themeManager } from './theme-manager.js';
import { ColorUtils } from '../utils/color-utils.js';
import { DOMUtils } from '../utils/dom-utils.js';

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
        <button class="copy-btn">Copy</button>
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

    // Update status demos
    this.updateStatusDemos(currentTheme);

    console.log(`🎨 Updated ${updateCount} semantic token previews`);
  }

  styleSemanticPreview(preview, token) {
    if (token.hex.includes("rgba")) {
      preview.style.cssText = `
      background: ${token.hex}; 
      color: var(--text-primary); 
      border: 1px solid var(--border-color);
      cursor: pointer;
    `;
    } else {
      const contrastTextColor = this.getContrastTextColor(token.hex);
      preview.style.cssText = `
      background-color: ${token.hex}; 
      color: ${contrastTextColor};
      border: 1px solid var(--border-soft);
      cursor: pointer;
    `;
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
      { id: "error-demo", bg: "error-background", fg: "error-foreground" },
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
    this.updateDemoTextElements(currentTheme);

    // Update semantic badges
    this.updateSemanticBadges(currentTheme);

    // Update text field styling
    this.updateTextFieldStyling();

    // Update user-selected indicators
    this.updateUserSelectedIndicators();

    console.log("🎨 Demo components updated");
  }

  updateDemoTextElements(theme) {
    const elements = [
      { selector: ".demo-heading", token: "text-primary" },
      { selector: ".demo-subheading", token: "text-secondary" },
      { selector: ".demo-body", token: "text-tertiary" },
      { selector: ".demo-caption", token: "text-quaternary" },
    ];

    elements.forEach(({ selector, token }) => {
      const element = document.querySelector(selector);
      if (element && state.semanticTokens[token]) {
        element.style.color = state.semanticTokens[token][theme].hex;
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
      // Reset any inline styles that might conflict
      field.style.borderColor = "";
      field.style.boxShadow = "";

      // Re-apply CSS classes to ensure proper styling
      if (field.classList.contains("success")) {
        field.style.borderColor = "var(--success-fg)";
      } else if (field.classList.contains("error")) {
        field.style.borderColor = "var(--error-fg)";
      }
    });
  }

  updateUserSelectedIndicators() {
    if (!state.semanticTokens?.["fg-white"]) return;

    const indicators = document.querySelectorAll(".user-selected-indicator");
    const currentTheme = themeManager.getCurrentTheme();
    const whiteColor = state.semanticTokens["fg-white"][currentTheme].hex;

    // Update indicator colors to white
    indicators.forEach((indicator) => {
      indicator.style.backgroundColor = whiteColor;
    });

    // Reset any special styling from user-selected cards
    const userSelectedCards = document.querySelectorAll(".primitive-card");
    userSelectedCards.forEach((card) => {
      const isUserSelected = card.querySelector(".user-selected-indicator");
      if (isUserSelected) {
        card.style.borderColor = "";
        card.style.boxShadow = "";

        const nameElement = card.querySelector(".primitive-name");
        if (nameElement) {
          nameElement.style.color = "";
        }

        const infoElement = card.querySelector(".primitive-info");
        if (infoElement) {
          infoElement.style.background = "";
        }
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
