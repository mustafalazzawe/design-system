// =============================================================================
// Modular Color Design System Configuration
// =============================================================================

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

export const COLOR_SYSTEM_CONFIG = {
  // Base colors - these will generate the full scales
  baseColors: {
    neutral: {
      name: "neutral", // Always use "neutral" for custom colors
      base: "#71717a", // Base color (usually 500 level)
      hex: "#71717a", // Same as base for now
    },
    primary: {
      name: "primary", // Always use "primary" for custom colors
      base: "#3b82f6", // Base color (usually 500 level)
      hex: "#3b82f6", // Same as base for now
    },
  },

  // Project metadata
  project: {
    name: "Semantic Color Design System",
    description:
      "A comprehensive color system built on primitive colors with semantic tokens for consistent,accessible design",
  },

  // Customization options
  options: {
    autoDetectColorNames: false, // Disabled - only use for presets
    generateFullScale: true, // Generate 50-950 scale for each color
    includeAlphaColors: true, // Include alpha/transparency colors
    includeStatusColors: true, // Include success/warning/error colors
    includeFamilyContrast: true, // Include family contrast checking
    useSmartPositioning: true, // Use smart positioning for color scales
  },
};

// Color detection mappings for auto-detection (only used for presets for now)
export const COLOR_MAPPINGS = Object.freeze({
  // Neutrals/Greys
  slate: { hue: [200, 220], saturation: [0, 20] },
  gray: { hue: [0, 360], saturation: [0, 10] },
  zinc: { hue: [0, 360], saturation: [0, 5] },
  neutral: { hue: [0, 360], saturation: [0, 8] },
  stone: { hue: [20, 40], saturation: [5, 15] },

  // Blues
  sky: { hue: [190, 210], saturation: [70, 100] },
  blue: { hue: [210, 240], saturation: [70, 100] },
  indigo: { hue: [240, 260], saturation: [70, 100] },

  // Greens
  emerald: { hue: [150, 170], saturation: [70, 100] },
  green: { hue: [110, 140], saturation: [60, 100] },
  teal: { hue: [170, 190], saturation: [70, 100] },

  // Reds
  red: { hue: [0, 20], saturation: [70, 100] },
  rose: { hue: [340, 360], saturation: [70, 100] },
  pink: { hue: [320, 340], saturation: [70, 100] },

  // Yellows/Oranges
  yellow: { hue: [50, 70], saturation: [70, 100] },
  amber: { hue: [35, 55], saturation: [70, 100] },
  orange: { hue: [20, 40], saturation: [70, 100] },

  // Purples
  purple: { hue: [260, 290], saturation: [70, 100] },
  violet: { hue: [250, 270], saturation: [70, 100] },
  fuchsia: { hue: [290, 320], saturation: [70, 100] },
});

// Lightness values for each scale step
export const LIGHTNESS_SCALE = Object.freeze({
  50: 98,
  100: 96,
  200: 91,
  300: 84,
  400: 68,
  500: 50, // Default reference point
  600: 43,
  700: 35,
  800: 27,
  900: 16,
  950: 8,
});

// Status color values (consistent across themes)
export const STATUS_COLORS = Object.freeze({
  success: {
    light: { primary: "#16a34a", background: "#dcfce7", foreground: "#16a34a" }, // green-600, green-100, green-600
    dark: { primary: "#16a34a", background: "#064e3b", foreground: "#4ade80" }, // green-600, green-900, green-400
  },
  warning: {
    light: { primary: "#eab308", background: "#fef3c7", foreground: "#d97706" }, // amber-500, amber-100, amber-600
    dark: { primary: "#eab308", background: "#451a03", foreground: "#fbbf24" }, // amber-500, amber-900, amber-400
  },
  error: {
    light: { primary: "#dc2626", background: "#fee2e2", foreground: "#dc2626" }, // red-600, red-100, red-600
    dark: { primary: "#dc2626", background: "#450a0a", foreground: "#f87171" }, // red-600, red-900, red-400
  },
});

// =============================================================================
// COLOR UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert hex color to HSL
 * @param {string} hex - Hex color string
 * @returns {Object|null} HSL object with h, s, l properties or null if invalid
 */
export function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Convert hex to RGB array
 * @param {string} hex - Hex color string
 * @returns {Array|null} RGB array [r, g, b] or null if invalid
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Detect color name based on HSL values
 * @param {string} hex - Hex color string
 * @returns {string} Detected color name or "custom"
 */
export function detectColorName(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return "custom";

  // For very low saturation, it's likely a neutral
  if (hsl.s <= 10) {
    if (hsl.s <= 5) return "zinc";
    if (hsl.s <= 8) return "neutral";
    return "gray";
  }

  // Check against known color mappings
  for (const [colorName, range] of Object.entries(COLOR_MAPPINGS)) {
    const hueInRange = hsl.h >= range.hue[0] && hsl.h <= range.hue[1];
    const satInRange =
      hsl.s >= range.saturation[0] && hsl.s <= range.saturation[1];

    if (hueInRange && satInRange) {
      return colorName;
    }
  }

  return "custom";
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================================
// COLOR SCALE GENERATION
// =============================================================================

/**
 * Generate a complete color scale from a base color
 * @param {string} baseHex - Base hex color
 * @param {string} colorName - Name for the color family
 * @param {boolean} useSmartPositioning - Whether to use smart positioning
 * @returns {Object|null} Color scale object or null if invalid
 */
export function generateColorScale(baseHex, colorName, useSmartPositioning = false) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return null;

  const isNeutral = hsl.s <= 15;
  let basePosition = 500; // Default position

  // Smart positioning: find where user's color best fits
  if (useSmartPositioning) {
    const baseLightness = hsl.l;
    let closestDiff = Infinity;
    let closestWeight = 500;

    Object.entries(LIGHTNESS_SCALE).forEach(([weight, lightness]) => {
      const diff = Math.abs(baseLightness - lightness);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestWeight = parseInt(weight);
      }
    });

    basePosition = closestWeight;
  }

  const scale = {};

  // Generate each color in the scale
  Object.entries(LIGHTNESS_SCALE).forEach(([weight, lightness]) => {
    const weightNum = parseInt(weight);
    let finalHex, finalName;

    if (useSmartPositioning && weightNum === basePosition) {
      // Use the exact user-provided color
      finalHex = baseHex.toUpperCase();
    } else {
      // Generate shade relative to the user's color
      let adjustedSaturation = hsl.s;

      // For neutrals, adjust saturation at lighter weights
      if (isNeutral) {
        if (weightNum <= 200) {
          adjustedSaturation = Math.max(0, hsl.s * 0.3);
        } else if (weightNum <= 400) {
          adjustedSaturation = Math.max(0, hsl.s * 0.7);
        }
      }

      // Ensure we never go below 5% lightness to avoid pure black
      const safeLightness = Math.max(5, Math.min(98, lightness));
      finalHex = hslToHex(hsl.h, adjustedSaturation, safeLightness);
    }

    finalName = `${capitalize(colorName)} ${weight}`;

    scale[weight] = {
      hex: finalHex,
      name: finalName,
    };
  });

  return scale;
}

// =============================================================================
// SEMANTIC TOKEN GENERATION
// =============================================================================

/**
 * Generate semantic tokens from color scales
 * @param {Object} neutralScale - Neutral color scale
 * @param {Object} primaryScale - Primary color scale
 * @param {string} neutralName - Neutral color name
 * @param {string} primaryName - Primary color name
 * @returns {Object} Semantic tokens object
 */
export function generateSemanticTokens(
  neutralScale,
  primaryScale,
  neutralName,
  primaryName
) {
  const tokens = {};

  // Text tokens
  Object.assign(tokens, {
    "text-primary": {
      light: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
    },
    "text-primary-on-brand": {
      light: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
    },
    "text-secondary": {
      light: { hex: neutralScale[900].hex, name: `${neutralName}-900` },
      dark: { hex: neutralScale[300].hex, name: `${neutralName}-300` },
    },
    "text-tertiary": {
      light: { hex: neutralScale[700].hex, name: `${neutralName}-700` },
      dark: { hex: neutralScale[400].hex, name: `${neutralName}-400` },
    },
    "text-quaternary": {
      light: { hex: neutralScale[500].hex, name: `${neutralName}-500` },
      dark: { hex: neutralScale[400].hex, name: `${neutralName}-400` },
    },
    "text-white": {
      light: { hex: "#ffffff", name: "base-white" },
      dark: { hex: "#ffffff", name: "base-white" },
    },
    "text-disabled": {
      light: { hex: neutralScale[500].hex, name: `${neutralName}-500` },
      dark: { hex: neutralScale[500].hex, name: `${neutralName}-500` },
    },
    "text-placeholder": {
      light: { hex: neutralScale[500].hex, name: `${neutralName}-500` },
      dark: { hex: neutralScale[400].hex, name: `${neutralName}-400` },
    },
  });

  // Border tokens
  Object.assign(tokens, {
    "border-primary": {
      light: { hex: neutralScale[300].hex, name: `${neutralName}-300` },
      dark: { hex: neutralScale[600].hex, name: `${neutralName}-600` },
    },
    "border-secondary": {
      light: { hex: neutralScale[400].hex, name: `${neutralName}-400` },
      dark: { hex: neutralScale[700].hex, name: `${neutralName}-700` },
    },
    "border-tertiary": {
      light: { hex: neutralScale[200].hex, name: `${neutralName}-200` },
      dark: { hex: neutralScale[900].hex, name: `${neutralName}-900` },
    },
    "border-disabled": {
      light: { hex: neutralScale[300].hex, name: `${neutralName}-300` },
      dark: { hex: neutralScale[600].hex, name: `${neutralName}-600` },
    },
  });

  // Foreground tokens
  Object.assign(tokens, {
    "fg-primary": {
      light: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
    },
    "fg-primary-on-brand": {
      light: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
    },
    "fg-secondary": {
      light: { hex: neutralScale[900].hex, name: `${neutralName}-900` },
      dark: { hex: neutralScale[300].hex, name: `${neutralName}-300` },
    },
    "fg-tertiary": {
      light: { hex: neutralScale[700].hex, name: `${neutralName}-700` },
      dark: { hex: neutralScale[400].hex, name: `${neutralName}-400` },
    },
    "fg-white": {
      light: { hex: "#ffffff", name: "base-white" },
      dark: { hex: "#ffffff", name: "base-white" },
    },
    "fg-disabled": {
      light: { hex: neutralScale[500].hex, name: `${neutralName}-500` },
      dark: { hex: neutralScale[500].hex, name: `${neutralName}-500` },
    },
  });

  // Background tokens
  Object.assign(tokens, {
    "bg-primary": {
      light: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
      dark: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
    },
    "bg-secondary": {
      light: { hex: neutralScale[100].hex, name: `${neutralName}-100` },
      dark: { hex: neutralScale[900].hex, name: `${neutralName}-900` },
    },
    "bg-tertiary": {
      light: { hex: neutralScale[200].hex, name: `${neutralName}-200` },
      dark: { hex: neutralScale[800].hex, name: `${neutralName}-800` },
    },
    "bg-base": {
      light: { hex: "#ffffff", name: "base-white" },
      dark: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
    },
    "bg-modal-overlay": {
      light: { hex: "rgba(0,0,0,0.36)", name: "alpha-black-modal" },
      dark: { hex: "rgba(0,0,0,0.36)", name: "alpha-black-modal" },
    },
  });

  // Interactive tokens
  const primaryRgb = hexToRgb(primaryScale[600].hex);
  const focusLight = primaryRgb
    ? `rgba(${primaryRgb.join(", ")}, 0.3)`
    : primaryScale[200].hex;
  const focusDark = primaryRgb
    ? `rgba(${primaryRgb.join(", ")}, 0.4)`
    : primaryScale[800].hex;

  Object.assign(tokens, {
    "interactive-primary": {
      light: { hex: primaryScale[600].hex, name: `${primaryName}-600` },
      dark: { hex: primaryScale[600].hex, name: `${primaryName}-600` },
    },
    "interactive-primary-hover": {
      light: { hex: primaryScale[500].hex, name: `${primaryName}-500` },
      dark: { hex: primaryScale[500].hex, name: `${primaryName}-500` },
    },
    "interactive-primary-active": {
      light: { hex: primaryScale[400].hex, name: `${primaryName}-400` },
      dark: { hex: primaryScale[400].hex, name: `${primaryName}-400` },
    },
    "interactive-secondary": {
      light: { hex: "rgba(0,0,0,0.06)", name: "alpha-black-200" },
      dark: { hex: "rgba(255,255,255,0.06)", name: "alpha-white-200" },
    },
    "interactive-secondary-hover": {
      light: { hex: "rgba(0,0,0,0.04)", name: "alpha-black-100" },
      dark: { hex: "rgba(255,255,255,0.04)", name: "alpha-white-100" },
    },
    "interactive-secondary-active": {
      light: { hex: "rgba(0,0,0,0.02)", name: "alpha-black-50" },
      dark: { hex: "rgba(255,255,255,0.02)", name: "alpha-white-50" },
    },
    "interactive-focus": {
      light: { hex: focusLight, name: `${primaryName}-600-alpha-30` },
      dark: { hex: focusDark, name: `${primaryName}-600-alpha-40` },
    },
  });

  // Status colors using constants
  Object.assign(tokens, {
    "success-primary": {
      light: { hex: STATUS_COLORS.success.light.primary, name: "green-600" },
      dark: { hex: STATUS_COLORS.success.dark.primary, name: "green-600" },
    },
    "success-background": {
      light: { hex: STATUS_COLORS.success.light.background, name: "green-100" },
      dark: { hex: STATUS_COLORS.success.dark.background, name: "green-900" },
    },
    "success-foreground": {
      light: { hex: STATUS_COLORS.success.light.foreground, name: "green-600" },
      dark: { hex: STATUS_COLORS.success.dark.foreground, name: "green-400" },
    },
    "success-focus": {
      light: {
        hex: `rgba(${hexToRgb(STATUS_COLORS.success.light.foreground).join(
          ", "
        )}, 0.3)`,
        name: "green-600-alpha-30",
      },
      dark: {
        hex: `rgba(${hexToRgb(STATUS_COLORS.success.dark.foreground).join(
          ", "
        )}, 0.4)`,
        name: "green-400-alpha-40",
      },
    },

    "warning-primary": {
      light: { hex: STATUS_COLORS.warning.light.primary, name: "amber-500" },
      dark: { hex: STATUS_COLORS.warning.dark.primary, name: "amber-500" },
    },
    "warning-background": {
      light: { hex: STATUS_COLORS.warning.light.background, name: "amber-100" },
      dark: { hex: STATUS_COLORS.warning.dark.background, name: "amber-900" },
    },
    "warning-foreground": {
      light: { hex: STATUS_COLORS.warning.light.foreground, name: "amber-600" },
      dark: { hex: STATUS_COLORS.warning.dark.foreground, name: "amber-400" },
    },
    "warning-focus": {
      light: {
        hex: `rgba(${hexToRgb(STATUS_COLORS.warning.light.foreground).join(
          ", "
        )}, 0.3)`,
        name: "amber-600-alpha-30",
      },
      dark: {
        hex: `rgba(${hexToRgb(STATUS_COLORS.warning.dark.foreground).join(
          ", "
        )}, 0.4)`,
        name: "amber-400-alpha-40",
      },
    },

    "error-primary": {
      light: { hex: STATUS_COLORS.error.light.primary, name: "red-600" },
      dark: { hex: STATUS_COLORS.error.dark.primary, name: "red-600" },
    },
    "error-background": {
      light: { hex: STATUS_COLORS.error.light.background, name: "red-100" },
      dark: { hex: STATUS_COLORS.error.dark.background, name: "red-900" },
    },
    "error-foreground": {
      light: { hex: STATUS_COLORS.error.light.foreground, name: "red-600" },
      dark: { hex: STATUS_COLORS.error.dark.foreground, name: "red-400" },
    },
    "error-focus": {
      light: {
        hex: `rgba(${hexToRgb(STATUS_COLORS.error.light.foreground).join(
          ", "
        )}, 0.3)`,
        name: "red-600-alpha-30",
      },
      dark: {
        hex: `rgba(${hexToRgb(STATUS_COLORS.error.dark.foreground).join(
          ", "
        )}, 0.4)`,
        name: "red-400-alpha-40",
      },
    },
  });

  return tokens;
}

// =============================================================================
// SYSTEM INITIALIZATION
// =============================================================================

/**
 * Initialize the color system with a given configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Initialized color system
 */
export function initializeColorSystem(config = COLOR_SYSTEM_CONFIG) {
  const { baseColors, options } = config;

  // Auto-detect color names for presets only
  if (
    options.autoDetectColorNames &&
    baseColors.neutral.name !== "neutral" &&
    baseColors.primary.name !== "primary"
  ) {
    if (!baseColors.neutral.name || baseColors.neutral.name === "auto") {
      baseColors.neutral.name = detectColorName(baseColors.neutral.base);
    }
    if (!baseColors.primary.name || baseColors.primary.name === "auto") {
      baseColors.primary.name = detectColorName(baseColors.primary.base);
    }
  }

  // Generate color scales
  const neutralScale = generateColorScale(
    baseColors.neutral.base,
    baseColors.neutral.name,
    options.useSmartPositioning
  );

  const primaryScale = generateColorScale(
    baseColors.primary.base,
    baseColors.primary.name,
    options.useSmartPositioning
  );

  // Generate semantic tokens
  const semanticTokens = generateSemanticTokens(
    neutralScale,
    primaryScale,
    baseColors.neutral.name,
    baseColors.primary.name
  );

  return {
    config,
    scales: { neutral: neutralScale, primary: primaryScale },
    semanticTokens,
    meta: {
      neutralName: baseColors.neutral.name,
      primaryName: baseColors.primary.name,
      generatedAt: new Date().toISOString(),
      version: "2.0.0",
    },
  };
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Deep freeze utility to prevent preset mutation
 * @param {Object} obj - Object to freeze
 * @returns {Object} Frozen object
 */
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === "object" || typeof obj[prop] === "function")
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

// Immutable preset configurations
export const PRESET_CONFIGS = deepFreeze({
  default: {
    baseColors: {
      neutral: { name: "zinc", base: "#71717a", hex: "#71717a" },
      primary: { name: "blue", base: "#3b82f6", hex: "#3b82f6" },
    },
    project: { name: "Default Design System" },
    options: { ...COLOR_SYSTEM_CONFIG.options, autoDetectColorNames: true },
  },

  modern: {
    baseColors: {
      neutral: { name: "slate", base: "#64748b", hex: "#64748b" },
      primary: { name: "indigo", base: "#6366f1", hex: "#6366f1" },
    },
    project: { name: "Modern Design System" },
    options: { ...COLOR_SYSTEM_CONFIG.options, autoDetectColorNames: true },
  },

  natural: {
    baseColors: {
      neutral: { name: "stone", base: "#78716c", hex: "#78716c" },
      primary: { name: "emerald", base: "#10b981", hex: "#10b981" },
    },
    project: { name: "Natural Design System" },
    options: { ...COLOR_SYSTEM_CONFIG.options, autoDetectColorNames: true },
  },

  custom: {
    baseColors: {
      neutral: { name: "neutral", base: "#6b7280", hex: "#6b7280" },
      primary: { name: "primary", base: "#8b5cf6", hex: "#8b5cf6" },
    },
    project: { name: "Custom Design System" },
    options: { ...COLOR_SYSTEM_CONFIG.options, autoDetectColorNames: false },
  },
});

console.log("🎨 Modular Color System v2.0 loaded");
console.log("📋 Available presets:", Object.keys(PRESET_CONFIGS));
console.log("🔒 Presets are immutable and protected from modification");