// =============================================================================
// Modular Color Design System - Main Application
// =============================================================================

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

class ColorSystemState {
  constructor() {
    this.currentColorSystem = null;
    this.neutralColors = {};
    this.primaryColors = {};
    this.semanticTokens = {};
    this.activeConfig = this.getDefaultConfig();
  }

  getDefaultConfig() {
    // Use the default preset configuration for initial load
    return {
      baseColors: {
        neutral: { name: "zinc", base: "#71717a", hex: "#71717a" },
        primary: { name: "blue", base: "#3b82f6", hex: "#3b82f6" },
      },
      project: {
        name: "Semantic Color Design System",
        description:
          "A comprehensive color system built on primitive colors with semantic tokens for consistent, accessible design",
      },
      options: {
        autoDetectColorNames: true,
        generateFullScale: true,
        includeAlphaColors: true,
        includeStatusColors: true,
        includeFamilyContrast: true,
      },
    };
  }

  updateColorSystem(config = this.activeConfig) {
    try {
      this.currentColorSystem = initializeColorSystem(config);
      this.neutralColors = this.currentColorSystem.scales.neutral;
      this.primaryColors = this.currentColorSystem.scales.primary;
      this.semanticTokens = this.currentColorSystem.semanticTokens;
      this.activeConfig = config;
      return true;
    } catch (error) {
      console.error("Failed to update color system:", error);
      return false;
    }
  }

  loadPreset(presetName) {
    if (!window.PRESET_CONFIGS?.[presetName]) {
      console.warn(`Preset '${presetName}' not found`);
      return false;
    }

    const presetConfig = JSON.parse(
      JSON.stringify(window.PRESET_CONFIGS[presetName])
    );
    const newConfig = {
      ...this.getDefaultConfig(),
      ...presetConfig,
      options: { ...this.getDefaultConfig().options, ...presetConfig.options },
    };

    return this.updateColorSystem(newConfig);
  }

  setCustomColors(neutralHex, primaryHex) {
    const customConfig = JSON.parse(JSON.stringify(this.activeConfig));

    customConfig.baseColors.neutral.base = neutralHex;
    customConfig.baseColors.neutral.hex = neutralHex;
    customConfig.baseColors.neutral.name = "neutral";

    customConfig.baseColors.primary.base = primaryHex;
    customConfig.baseColors.primary.hex = primaryHex;
    customConfig.baseColors.primary.name = "primary";

    customConfig.options.autoDetectColorNames = false;

    return this.updateColorSystem(customConfig);
  }
}

// Global state instance
const state = new ColorSystemState();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const utils = {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  },

  hexToRgba(hex, alpha = 1) {
    const rgb = this.hexToRgb(hex);
    return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})` : hex;
  },

  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(...color1);
    const l2 = this.getLuminance(...color2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },

  isLightColor(hex) {
    if (hex.includes("rgba")) return true;
    const rgb = this.hexToRgb(hex);
    if (!rgb) return true;
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128;
  },

  isMainColor(hex, colorFamily) {
    const baseColor =
      colorFamily === state.currentColorSystem?.meta.neutralName
        ? state.activeConfig.baseColors.neutral.base
        : state.activeConfig.baseColors.primary.base;
    return hex.toLowerCase() === baseColor?.toLowerCase();
  },

  getContrastInfo(hex, colorFamily) {
    const rgb = this.hexToRgb(hex);
    if (!rgb)
      return {
        aaWhite: false,
        aaBlack: false,
        aaaWhite: false,
        aaaBlack: false,
        family: {},
      };

    const whiteContrast = this.getContrastRatio(rgb, [255, 255, 255]);
    const blackContrast = this.getContrastRatio(rgb, [0, 0, 0]);

    let familyContrasts = {};
    const currentColors =
      colorFamily === state.currentColorSystem?.meta.neutralName
        ? state.neutralColors
        : state.primaryColors;

    if (currentColors) {
      Object.entries(currentColors).forEach(([weight, colorData]) => {
        const shadeRgb = this.hexToRgb(colorData.hex);
        if (shadeRgb) {
          const contrast = this.getContrastRatio(rgb, shadeRgb);
          if (contrast >= 4.5 && hex !== colorData.hex) {
            familyContrasts[weight] = {
              ratio: contrast,
              hex: colorData.hex,
              aa: contrast >= 4.5,
              aaa: contrast >= 7,
            };
          }
        }
      });
    }

    return {
      white: whiteContrast,
      black: blackContrast,
      aaWhite: whiteContrast >= 4.5,
      aaBlack: blackContrast >= 4.5,
      aaaWhite: whiteContrast >= 7,
      aaaBlack: blackContrast >= 7,
      family: familyContrasts,
    };
  },

  copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => this.showFeedback("Copied!"))
        .catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText =
      "position: fixed; left: -999999px; top: -999999px;";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      this.showFeedback("Copied!");
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
        ? state.semanticTokens?.["success-foreground"]?.light?.hex || "#10b981"
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

// =============================================================================
// CSS VARIABLE UPDATER
// =============================================================================

class CSSUpdater {
  updateVariables() {
    if (!state.currentColorSystem || !state.semanticTokens) return;

    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme") || "light";
    const updates = {};

    // Background colors
    this.addColorVars(updates, currentTheme, "bg", [
      "primary",
      "secondary",
      "tertiary",
      "base",
      "modal-overlay",
    ]);

    // Text colors
    this.addColorVars(updates, currentTheme, "text", [
      "primary",
      "secondary",
      "tertiary",
      "quaternary",
      "primary-on-brand",
    ]);

    // Border colors
    this.addColorVars(updates, currentTheme, "border", [
      "primary",
      "secondary",
      "tertiary",
    ]);
    updates["--border-color"] =
      state.semanticTokens["border-primary"][currentTheme].hex;

    // Interactive colors
    updates["--interactive-primary"] =
      state.semanticTokens["interactive-primary"][currentTheme].hex;
    updates["--interactive-primary-hover"] =
      state.semanticTokens["interactive-primary-hover"][currentTheme].hex;
    updates["--interactive-primary-active"] =
      state.semanticTokens["interactive-primary-active"][currentTheme].hex;
    updates["--interactive-secondary"] =
      state.semanticTokens["interactive-secondary"][currentTheme].hex;
    updates["--interactive-secondary-hover"] =
      state.semanticTokens["interactive-secondary-hover"][currentTheme].hex;
    updates["--interactive-focus"] =
      state.semanticTokens["interactive-focus"][currentTheme].hex;

    // Status colors
    updates["--success-primary"] =
      state.semanticTokens["success-primary"][currentTheme].hex;
    updates["--success-bg"] =
      state.semanticTokens["success-background"][currentTheme].hex;
    updates["--success-fg"] =
      state.semanticTokens["success-foreground"][currentTheme].hex;
    updates["--success-focus"] =
      state.semanticTokens["success-focus"][currentTheme].hex;

    updates["--warning-primary"] =
      state.semanticTokens["warning-primary"][currentTheme].hex;
    updates["--warning-bg"] =
      state.semanticTokens["warning-background"][currentTheme].hex;
    updates["--warning-fg"] =
      state.semanticTokens["warning-foreground"][currentTheme].hex;
    updates["--warning-focus"] =
      state.semanticTokens["warning-focus"][currentTheme].hex;

    updates["--error-primary"] =
      state.semanticTokens["error-primary"][currentTheme].hex;
    updates["--error-bg"] =
      state.semanticTokens["error-background"][currentTheme].hex;
    updates["--error-fg"] =
      state.semanticTokens["error-foreground"][currentTheme].hex;
    updates["--error-focus"] =
      state.semanticTokens["error-focus"][currentTheme].hex;

    // Primitive colors
    this.addPrimitiveVars(updates, "neutral", state.neutralColors);
    this.addPrimitiveVars(updates, "primary", state.primaryColors);

    // Calculated colors
    updates["--border-soft"] = utils.hexToRgba(
      state.semanticTokens["border-primary"][currentTheme].hex,
      0.5
    );
    updates["--modal-overlay"] =
      state.semanticTokens["bg-modal-overlay"][currentTheme].hex;

    // Apply all updates
    Object.entries(updates).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  addColorVars(updates, theme, prefix, suffixes) {
    suffixes.forEach((suffix) => {
      const tokenName = `${prefix}-${suffix}`;
      const token = state.semanticTokens[tokenName];
      if (token?.[theme]) {
        updates[`--${tokenName}`] = token[theme].hex;
      }
    });
  }

  addPrimitiveVars(updates, colorName, colors) {
    if (colors) {
      Object.entries(colors).forEach(([weight, color]) => {
        updates[`--${colorName}-${weight}`] = color.hex;
      });
    }
  }
}

const cssUpdater = new CSSUpdater();

// =============================================================================
// THEME MANAGEMENT
// =============================================================================

class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    const preferredTheme = this.getStoredTheme();
    this.setTheme(preferredTheme);
    this.setupMediaQueryListener();
  }

  getStoredTheme() {
    try {
      const stored = localStorage.getItem("theme-preference");
      if (stored === "light" || stored === "dark") return stored;
    } catch (error) {
      console.warn("Could not read theme preference:", error);
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  setTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "light";

    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("theme-preference", theme);
    } catch (error) {
      console.warn("Could not save theme preference:", error);
    }

    this.updateUI(theme);

    if (state.currentColorSystem && state.semanticTokens) {
      cssUpdater.updateVariables();
      renderer.updateSemanticTokens();
      renderer.updateDemoComponents();
    }
  }

  updateUI(theme) {
    const icon = document.getElementById("theme-icon");
    const text = document.getElementById("theme-text");

    if (icon && text) {
      if (theme === "dark") {
        icon.textContent = "☀️";
        text.textContent = "Light";
      } else {
        icon.textContent = "🌙";
        text.textContent = "Dark";
      }
    }
  }

  toggle() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  setupMediaQueryListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        const hasStoredPreference = localStorage.getItem("theme-preference");
        if (!hasStoredPreference) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
    }
  }
}

const themeManager = new ThemeManager();

// =============================================================================
// RENDERING SYSTEM
// =============================================================================

class Renderer {
  updatePageMetadata() {
    if (!state.currentColorSystem) return;

    const titleElement = document.querySelector("h1");
    const subtitleElement = document.querySelector(".subtitle");
    const neutralTitle = document.getElementById("neutral-section-title");
    const primaryTitle = document.getElementById("primary-section-title");

    if (titleElement) {
      titleElement.textContent =
        state.currentColorSystem.config.project?.name || "Color Design System";
    }

    if (subtitleElement) {
      subtitleElement.textContent =
        state.currentColorSystem.config.project?.description ||
        "A comprehensive color system built on primitive colors with semantic tokens";
    }

    if (neutralTitle) {
      neutralTitle.textContent =
        state.currentColorSystem.meta.neutralName.charAt(0).toUpperCase() +
        state.currentColorSystem.meta.neutralName.slice(1);
    }

    if (primaryTitle) {
      primaryTitle.textContent =
        state.currentColorSystem.meta.primaryName.charAt(0).toUpperCase() +
        state.currentColorSystem.meta.primaryName.slice(1);
    }
  }

  createPrimitiveCard(hex, name, colorFamily) {
    const isLight = utils.isLightColor(hex);
    const textColor = isLight ? "#27272a" : "#f4f4f5";
    const contrast = utils.getContrastInfo(hex, colorFamily);
    const isMainColorCard = utils.isMainColor(hex, colorFamily);

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
    const swatch = card.querySelector(".primitive-swatch");
    const copyBtn = card.querySelector(".copy-btn");

    swatch.addEventListener("click", () => utils.copyToClipboard(hex));
    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      utils.copyToClipboard(hex);
    });

    return card;
  }

  renderPrimitiveGrid(colors, containerId, colorFamily) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    Object.entries(colors).forEach(([weight, color]) => {
      const card = this.createPrimitiveCard(color.hex, color.name, colorFamily);
      container.appendChild(card);
    });
  }

  updateSemanticTokens() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";

    Object.keys(state.semanticTokens).forEach((tokenName) => {
      const preview = document.getElementById(`${tokenName}-preview`);
      if (preview) {
        const token = state.semanticTokens[tokenName][currentTheme];
        preview.textContent = token.name;

        if (token.hex.includes("rgba")) {
          preview.style.cssText = `
            background: ${token.hex}; 
            color: var(--text-primary); 
            border: 1px solid var(--border-color);
            cursor: pointer;
          `;
        } else {
          const isLight = utils.isLightColor(token.hex);
          preview.style.cssText = `
            background-color: ${token.hex}; 
            color: ${isLight ? "#27272a" : "#f4f4f5"};
            border: 1px solid var(--border-soft);
            cursor: pointer;
          `;
        }

        preview.onclick = () => utils.copyToClipboard(token.hex);
      }
    });

    this.updateStatusDemos(currentTheme);
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

  updateDemoComponents() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";

    // Update demo text elements
    const elements = [
      { selector: ".demo-heading", token: "text-primary" },
      { selector: ".demo-subheading", token: "text-secondary" },
      { selector: ".demo-body", token: "text-tertiary" },
      { selector: ".demo-caption", token: "text-quaternary" },
    ];

    elements.forEach(({ selector, token }) => {
      const element = document.querySelector(selector);
      if (element && state.semanticTokens[token]) {
        element.style.color = state.semanticTokens[token][currentTheme].hex;
      }
    });

    // Update ALL semantic badges (not just the first one)
    const semanticBadges = document.querySelectorAll(".semantic-badge");
    if (
      semanticBadges.length > 0 &&
      state.semanticTokens["success-background"] &&
      state.semanticTokens["success-foreground"]
    ) {
      const successBg =
        state.semanticTokens["success-background"][currentTheme].hex;
      const successFg =
        state.semanticTokens["success-foreground"][currentTheme].hex;

      semanticBadges.forEach((badge) => {
        badge.style.backgroundColor = successBg;
        badge.style.color = successFg;
      });
    }

    // Update text field styling
    this.updateTextFieldStyling();

    // Update user-selected indicators
    this.updateUserSelectedIndicators();
  }

  updateUserSelectedIndicators() {
    if (!state.semanticTokens?.["fg-white"]) return;

    const indicators = document.querySelectorAll(".user-selected-indicator");
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const whiteColor = state.semanticTokens["fg-white"][currentTheme].hex;

    // Update indicator colors to white
    indicators.forEach((indicator) => {
      indicator.style.backgroundColor = whiteColor;
    });

    // Remove any special styling from user-selected cards
    const userSelectedCards = document.querySelectorAll(".primitive-card");
    userSelectedCards.forEach((card) => {
      const isUserSelected = card.querySelector(".user-selected-indicator");
      if (isUserSelected) {
        // Reset all special styling to make it look like other cards
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

  renderInterface() {
    if (!state.currentColorSystem) return;

    this.updatePageMetadata();

    this.renderPrimitiveGrid(
      state.neutralColors,
      "neutral-grid",
      state.currentColorSystem.meta.neutralName
    );
    this.renderPrimitiveGrid(
      state.primaryColors,
      "primary-grid",
      state.currentColorSystem.meta.primaryName
    );

    this.updateSemanticTokens();
    this.updateDemoComponents();
  }
}

const renderer = new Renderer();

// =============================================================================
// CONFIGURATION PANEL
// =============================================================================

class ConfigPanel {
  constructor() {
    this.panel = document.getElementById("config-panel");
    this.applyFeedbackTimeout = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateInputs();
  }

  bindEvents() {
    // Form elements
    const presetSelect = document.getElementById("preset-select");
    const neutralColorInput = document.getElementById("neutral-color");
    const primaryColorInput = document.getElementById("primary-color");
    const neutralHexInput = document.getElementById("neutral-hex");
    const primaryHexInput = document.getElementById("primary-hex");
    const applyButton = document.getElementById("apply-config");
    const closeButton = document.getElementById("close-config");
    const exportButton = document.getElementById("export-config");

    // Preset selection
    presetSelect?.addEventListener("change", (e) => this.handlePresetChange(e));

    // Color picker synchronization
    neutralColorInput?.addEventListener("input", (e) =>
      this.handleColorChange(e, "neutral")
    );
    primaryColorInput?.addEventListener("input", (e) =>
      this.handleColorChange(e, "primary")
    );
    neutralHexInput?.addEventListener("input", (e) =>
      this.handleHexChange(e, "neutral")
    );
    primaryHexInput?.addEventListener("input", (e) =>
      this.handleHexChange(e, "primary")
    );

    // Actions
    applyButton?.addEventListener("click", () => this.applyChanges());
    closeButton?.addEventListener("click", () => this.toggle());
    exportButton?.addEventListener("click", () => this.exportConfig());

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (
        this.panel?.classList.contains("show") &&
        !this.panel.contains(e.target) &&
        !document.getElementById("config-toggle")?.contains(e.target)
      ) {
        this.toggle();
      }
    });
  }

  handlePresetChange(e) {
    if (e.target.value !== "custom") {
      const presetConfig = window.PRESET_CONFIGS[e.target.value];
      if (presetConfig) {
        this.updateFormWithPreset(presetConfig);
      }
    }
  }

  handleColorChange(e, colorType) {
    const hexInput = document.getElementById(`${colorType}-hex`);
    if (hexInput) {
      hexInput.value = e.target.value;
    }
    this.updateDetectedColors();
    this.setCustomMode();
  }

  handleHexChange(e, colorType) {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      const colorInput = document.getElementById(`${colorType}-color`);
      if (colorInput) {
        colorInput.value = e.target.value;
      }
      this.updateDetectedColors();
      this.setCustomMode();
    }
  }

  updateFormWithPreset(presetConfig) {
    const neutralColorInput = document.getElementById("neutral-color");
    const primaryColorInput = document.getElementById("primary-color");
    const neutralHexInput = document.getElementById("neutral-hex");
    const primaryHexInput = document.getElementById("primary-hex");
    const detectedColors = document.getElementById("detected-colors");

    if (
      neutralColorInput &&
      primaryColorInput &&
      neutralHexInput &&
      primaryHexInput
    ) {
      neutralColorInput.value = presetConfig.baseColors.neutral.base;
      primaryColorInput.value = presetConfig.baseColors.primary.base;
      neutralHexInput.value = presetConfig.baseColors.neutral.base;
      primaryHexInput.value = presetConfig.baseColors.primary.base;

      if (detectedColors) {
        const neutralName = presetConfig.baseColors.neutral.name;
        const primaryName = presetConfig.baseColors.primary.name;
        detectedColors.textContent = `Neutral: ${
          neutralName.charAt(0).toUpperCase() + neutralName.slice(1)
        }, Primary: ${
          primaryName.charAt(0).toUpperCase() + primaryName.slice(1)
        }`;
      }
    }
  }

  setCustomMode() {
    const presetSelect = document.getElementById("preset-select");
    if (presetSelect) {
      presetSelect.value = "custom";
    }
  }

  updateDetectedColors() {
    const detectedColors = document.getElementById("detected-colors");
    if (detectedColors) {
      detectedColors.textContent = "Neutral: Neutral, Primary: Primary";
    }
  }

  updateInputs() {
    const presetSelect = document.getElementById("preset-select");
    const neutralColorInput = document.getElementById("neutral-color");
    const primaryColorInput = document.getElementById("primary-color");
    const neutralHexInput = document.getElementById("neutral-hex");
    const primaryHexInput = document.getElementById("primary-hex");
    const detectedColors = document.getElementById("detected-colors");

    if (
      neutralColorInput &&
      primaryColorInput &&
      neutralHexInput &&
      primaryHexInput
    ) {
      neutralColorInput.value = state.activeConfig.baseColors.neutral.base;
      primaryColorInput.value = state.activeConfig.baseColors.primary.base;
      neutralHexInput.value = state.activeConfig.baseColors.neutral.base;
      primaryHexInput.value = state.activeConfig.baseColors.primary.base;
    }

    // Set the correct preset selection based on current config
    if (presetSelect) {
      const currentConfig = state.activeConfig;
      const isZincBlue =
        currentConfig.baseColors.neutral.name === "zinc" &&
        currentConfig.baseColors.primary.name === "blue" &&
        currentConfig.options.autoDetectColorNames;

      if (isZincBlue) {
        presetSelect.value = "default";
      } else if (
        currentConfig.baseColors.neutral.name === "neutral" &&
        currentConfig.baseColors.primary.name === "primary"
      ) {
        presetSelect.value = "custom";
      } else {
        // Try to find matching preset
        let matchingPreset = "custom";
        Object.entries(window.PRESET_CONFIGS || {}).forEach(
          ([presetName, presetConfig]) => {
            if (
              presetConfig.baseColors.neutral.name ===
                currentConfig.baseColors.neutral.name &&
              presetConfig.baseColors.primary.name ===
                currentConfig.baseColors.primary.name
            ) {
              matchingPreset = presetName;
            }
          }
        );
        presetSelect.value = matchingPreset;
      }
    }

    // Update detected colors display
    if (detectedColors) {
      const neutralName = state.activeConfig.baseColors.neutral.name;
      const primaryName = state.activeConfig.baseColors.primary.name;
      detectedColors.textContent = `Neutral: ${
        neutralName.charAt(0).toUpperCase() + neutralName.slice(1)
      }, Primary: ${
        primaryName.charAt(0).toUpperCase() + primaryName.slice(1)
      }`;
    }
  }

  applyChanges() {
    const presetSelect = document.getElementById("preset-select");
    const neutralColorInput = document.getElementById("neutral-color");
    const primaryColorInput = document.getElementById("primary-color");

    if (presetSelect?.value !== "custom") {
      state.loadPreset(presetSelect.value);
    } else {
      state.setCustomColors(neutralColorInput?.value, primaryColorInput?.value);
    }

    cssUpdater.updateVariables();
    renderer.renderInterface();
    this.showApplyFeedback();
  }

  showApplyFeedback() {
    const applyButton = document.getElementById("apply-config");
    if (!applyButton) return;

    if (this.applyFeedbackTimeout) {
      clearTimeout(this.applyFeedbackTimeout);
    }

    applyButton.classList.remove("applied");
    applyButton.textContent = "Apply Changes";
    applyButton.offsetHeight; // Force reflow

    applyButton.classList.add("applied");
    applyButton.textContent = "Applied!";

    this.applyFeedbackTimeout = setTimeout(() => {
      applyButton.classList.remove("applied");
      applyButton.textContent = "Apply Changes";
      this.applyFeedbackTimeout = null;
    }, 1500);
  }

  exportConfig() {
    const config = {
      ...state.currentColorSystem.config,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };

    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `color-system-config-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    utils.showFeedback("Config exported!");
  }

  toggle() {
    this.panel?.classList.toggle("show");
  }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

function handleKeyboardNavigation(event) {
  if (event.key === "Enter" || event.key === " ") {
    if (event.target.id === "theme-toggle") {
      event.preventDefault();
      themeManager.toggle();
    } else if (event.target.id === "config-toggle") {
      event.preventDefault();
      configPanel.toggle();
    }
  }

  if (event.key === "Escape") {
    const panel = document.getElementById("config-panel");
    if (panel?.classList.contains("show")) {
      configPanel.toggle();
    }
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function init() {
  console.log("Initializing Modular Color Design System...");

  // Load the default preset to ensure correct color names
  const success = state.loadPreset("default");
  if (!success) {
    console.error("Failed to initialize color system");
    return;
  }

  // Update CSS variables and render interface
  cssUpdater.updateVariables();
  renderer.renderInterface();

  // Initialize configuration panel
  window.configPanel = new ConfigPanel();

  // Add event listeners
  const themeToggle = document.getElementById("theme-toggle");
  const configToggle = document.getElementById("config-toggle");

  themeToggle?.addEventListener("click", () => themeManager.toggle());
  themeToggle?.addEventListener("keydown", handleKeyboardNavigation);

  configToggle?.addEventListener("click", () => configPanel.toggle());
  configToggle?.addEventListener("keydown", handleKeyboardNavigation);

  document.addEventListener("keydown", handleKeyboardNavigation);

  // Global API
  window.colorSystem = {
    current: () => state.currentColorSystem,
    loadPreset: (name) => {
      const success = state.loadPreset(name);
      if (success) {
        cssUpdater.updateVariables();
        renderer.renderInterface();
        configPanel.updateInputs();
      }
      return success;
    },
    setCustomColors: (neutral, primary) => {
      const success = state.setCustomColors(neutral, primary);
      if (success) {
        cssUpdater.updateVariables();
        renderer.renderInterface();
        configPanel.updateInputs();
      }
      return success;
    },
    toggleConfig: () => configPanel.toggle(),
    reload: () => renderer.renderInterface(),
    export: () => configPanel.exportConfig(),
    setTheme: (theme) => themeManager.setTheme(theme),
    getTheme: () =>
      document.documentElement.getAttribute("data-theme") || "light",
    toggleTheme: () => themeManager.toggle(),
    updateStyling: () => {
      cssUpdater.updateVariables();
      renderer.updateDemoComponents();
    },
  };

  console.log("✅ Modular Color Design System initialized successfully");
  console.log("🎨 Current colors:", {
    neutral: state.currentColorSystem.meta.neutralName,
    primary: state.currentColorSystem.meta.primaryName,
  });
  console.log(
    "🌙 Current theme:",
    document.documentElement.getAttribute("data-theme")
  );
  console.log("⚙️ Click the Config button in the navbar to customize colors");
  console.log("🔧 Available via window.colorSystem object");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
