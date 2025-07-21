import { state } from './state.js';
import { ColorUtils } from '../utils/color-utils.js';

// =============================================================================
// CSS Variable Management System
// =============================================================================

class CSSUpdater {
  updateVariables() {
    if (!state.currentColorSystem || !state.semanticTokens) {
      console.warn("CSS Updater: No color system or semantic tokens available");
      return;
    }

    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme") || "light";
    const updates = {};

    // Text colors
    this.addColorVars(updates, currentTheme, "text", [
      "primary",
      "secondary",
      "tertiary",
      "quaternary",
      "primary-on-brand",
      "white",
      "disabled",
      "placeholder",
    ]);

    // Border colors
    this.addColorVars(updates, currentTheme, "border", [
      "primary",
      "secondary",
      "tertiary",
      "disabled",
    ]);

    // Foreground colors
    this.addColorVars(updates, currentTheme, "fg", [
      "primary",
      "primary-on-brand",
      "secondary",
      "tertiary",
      "white",
      "disabled",
    ]);

    // Background colors
    this.addColorVars(updates, currentTheme, "bg", [
      "primary",
      "secondary",
      "tertiary",
      "modal-overlay",
    ]);

    // Set the main border color for compatibility
    updates["--border-color"] =
      state.semanticTokens["border-primary"][currentTheme].hex;

    // Interactive colors
    this.addInteractiveVars(updates, currentTheme);

    // Status colors
    this.addStatusVars(updates, currentTheme);

    // Primitive colors
    this.addPrimitiveVars(updates, "neutral", state.neutralColors);
    this.addPrimitiveVars(updates, "primary", state.primaryColors);

    // Calculated/derived colors
    this.addCalculatedVars(updates, currentTheme);

    // Apply all updates to CSS
    this.applyUpdates(updates);
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

  addInteractiveVars(updates, theme) {
    const interactiveTokens = [
      "interactive-primary",
      "interactive-primary-hover",
      "interactive-primary-active",
      "interactive-secondary",
      "interactive-secondary-hover",
      "interactive-secondary-active",
      "interactive-tertiary",
      "interactive-focus",
    ];

    interactiveTokens.forEach((tokenName) => {
      const token = state.semanticTokens[tokenName];
      if (token?.[theme]) {
        updates[`--${tokenName}`] = token[theme].hex;
      }
    });
  }

  addStatusVars(updates, theme) {
    const statusTypes = ["success", "warning", "error"];
    const statusSuffixes = ["primary", "background", "foreground", "focus"];

    statusTypes.forEach((type) => {
      statusSuffixes.forEach((suffix) => {
        const tokenName = `${type}-${suffix}`;
        const token = state.semanticTokens[tokenName];
        if (token?.[theme]) {
          // Map to shorter CSS variable names for convenience
          const cssVarName =
            suffix === "background"
              ? `--${type}-bg`
              : suffix === "foreground"
              ? `--${type}-fg`
              : `--${type}-${suffix}`;
          updates[cssVarName] = token[theme].hex;
        }
      });
    });
  }

  addPrimitiveVars(updates, colorName, colors) {
    if (colors && typeof colors === "object") {
      Object.entries(colors).forEach(([weight, color]) => {
        if (color && color.hex) {
          updates[`--${colorName}-${weight}`] = color.hex;
        }
      });
    }
  }

  addCalculatedVars(updates, theme) {
    // Soft border variant
    const borderPrimary = state.semanticTokens["border-primary"]?.[theme]?.hex;
    if (borderPrimary) {
      updates["--border-soft"] = ColorUtils.hexToRgba(borderPrimary, 0.5);
    }

    // Modal overlay (already set in semantic tokens, but keeping for compatibility)
    const modalOverlay = state.semanticTokens["bg-modal-overlay"]?.[theme]?.hex;
    if (modalOverlay) {
      updates["--modal-overlay"] = modalOverlay;
    }
  }

  applyUpdates(updates) {
    const root = document.documentElement;
    let updateCount = 0;

    Object.entries(updates).forEach(([property, value]) => {
      if (value) {
        root.style.setProperty(property, value);
        updateCount++;
      }
    });

    console.log(`🎨 CSS Variables updated: ${updateCount} properties`);
  }

  // Method to force a complete refresh
  forceUpdate() {
    console.log("🔄 Forcing CSS variable refresh...");
    this.updateVariables();
  }

  // Method to get current CSS variable values (for debugging)
  getCurrentVars() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const vars = {};

    // Get all our custom properties
    const properties = [
      // Text colors
      "--text-primary",
      "--text-secondary",
      "--text-tertiary",

      // Interactive colors
      "--interactive-primary",
      "--interactive-focus",

      // Status colors
      "--success-primary",
      "--error-primary",
      "--warning-primary",

      // Primitives
      "--neutral-500",
      "--primary-500",
    ];

    properties.forEach((prop) => {
      vars[prop] = computedStyle.getPropertyValue(prop).trim();
    });

    return vars;
  }

  // Validation method
  validateCurrentState() {
    if (!state.isInitialized()) {
      console.error("CSS Updater: State not initialized");
      return false;
    }

    if (
      !state.semanticTokens ||
      Object.keys(state.semanticTokens).length === 0
    ) {
      console.error("CSS Updater: No semantic tokens available");
      return false;
    }

    return true;
  }
}

export const cssUpdater = new CSSUpdater();

