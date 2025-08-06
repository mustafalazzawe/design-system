import { ColorUtils } from "./utils/color-utils.js";
import { deepFreeze } from "./utils/object-utils.js";

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
    useExactInteractiveColors: false, // Whether we use the exact color or optimized color
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
    light: {
      primary: { name: "green-600", hex: "#16a34a" },
      background: { name: "green-200", hex: "#bbf7d0" },
      foreground: { name: "green-600", hex: "#16a34a" },
    },
    dark: {
      primary: { name: "green-600", hex: "#16a34a" },
      background: { name: "green-950", hex: "#052e16" },
      foreground: { name: "green-400", hex: "#4ade80" },
    },
  },
  warning: {
    light: {
      primary: { name: "amber-600", hex: "#d97706" },
      background: { name: "amber-200", hex: "#fde68a" },
      foreground: { name: "amber-600", hex: "#d97706" },
    },
    dark: {
      primary: { name: "amber-600", hex: "#d97706" },
      background: { name: "amber-950", hex: "#451a03" },
      foreground: { name: "amber-400", hex: "#fbbf24" },
    },
  },
  error: {
    light: {
      primary: { name: "red-600", hex: "#dc2626" },
      background: { name: "red-200", hex: "#fecaca" },
      foreground: { name: "red-600", hex: "#dc2626" },
    },
    dark: {
      primary: { name: "red-600", hex: "#dc2626" },
      background: { name: "red-950", hex: "#450a0a" },
      foreground: { name: "red-400", hex: "#f87171" },
    },
  },
});

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

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

// =============================================================================
// COLOR UTILITY FUNCTIONS
// =============================================================================

/**
 * Detect color name based on HSL values
 * @param {string} hex - Hex color string
 * @returns {string} Detected color name or "custom"
 */
export function detectColorName(hex) {
  const hsl = ColorUtils.hexToHsl(hex);
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
 * Find which scale weight best matches a given hex color
 * @param {string} targetHex - The hex color to match
 * @param {Object} colorScale - The color scale to search in
 * @returns {string|null} The weight (e.g., "400") or null if no close match
 */
export function findScaleWeight(targetHex, colorScale) {
  let bestMatch = null;
  let smallestDiff = Infinity;

  Object.entries(colorScale).forEach(([weight, colorData]) => {
    const targetRgb = ColorUtils.hexToRgb(targetHex);
    const scaleRgb = ColorUtils.hexToRgb(colorData.hex);

    if (targetRgb && scaleRgb) {
      // Calculate color difference (simple RGB distance)
      const diff = Math.sqrt(
        Math.pow(targetRgb.r - scaleRgb.r, 2) +
          Math.pow(targetRgb.g - scaleRgb.g, 2) +
          Math.pow(targetRgb.b - scaleRgb.b, 2)
      );

      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestMatch = weight;
      }
    }
  });

  // Only return if it's a reasonably close match (threshold can be adjusted)
  return smallestDiff < 50 ? bestMatch : null;
}

/**
 * Get adaptive hover/active states based on the primary color weight
 * @param {Object} primaryScale - The primary color scale
 * @param {string} baseWeight - The base weight (e.g., "400")
 * @param {string} primaryName - Name of the primary color
 * @returns {Object} Hover and active color definitions
 */
export function getAdaptiveInteractiveStates(primaryScale, baseWeight, primaryName) {
  const weightNum = parseInt(baseWeight);
  
  // Only calculate hover - active will be same as hover
  let hoverWeight;
  
  if (weightNum <= 300) {
    // For light colors, go darker for hover
    hoverWeight = Math.min(weightNum + 100, 950);
  } else if (weightNum >= 700) {
    // For dark colors, go lighter for hover
    hoverWeight = Math.max(weightNum - 100, 50);
  } else {
    // For middle range, go darker (traditional pattern)
    hoverWeight = Math.max(weightNum - 100, 50);
  }
  
  // Ensure we have this weight in our scale
  const availableWeights = Object.keys(primaryScale).map(w => parseInt(w));
  hoverWeight = availableWeights.reduce((prev, curr) => 
    Math.abs(curr - hoverWeight) < Math.abs(prev - hoverWeight) ? curr : prev
  );
  
  return {
    hover: {
      hex: primaryScale[hoverWeight].hex,
      name: `${primaryName}-${hoverWeight}`,
    },
    active: {
      hex: primaryScale[hoverWeight].hex, // Same as hover!
      name: `${primaryName}-${hoverWeight}`,
    }
  };
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
export function generateColorScale(
  baseHex,
  colorName,
  useSmartPositioning = false
) {
  const hsl = ColorUtils.hexToHsl(baseHex);
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
      finalHex = ColorUtils.hslToHex(hsl.h, adjustedSaturation, safeLightness);
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
  primaryName,
  options = {}
) {
  const tokens = {};

  // TODO: Create text and fg dark, these elements will always be dark

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
    "text-dark": {
      light: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
      dark: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
    },
    "text-light": {
      light: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
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
    "fg-dark": {
      light: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
      dark: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
    },
    "fg-light": {
      light: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
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
    "bg-dark": {
      light: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
      dark: { hex: neutralScale[950].hex, name: `${neutralName}-950` },
    },
    "bg-light": {
      light: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` },
    },
    "bg-modal-overlay": {
      light: { hex: "rgba(0,0,0,0.36)", name: "alpha-black-modal" },
      dark: { hex: "rgba(0,0,0,0.36)", name: "alpha-black-modal" },
    },
  });

  // Interactive color logic
  let primaryColor, hoverColor, activeColor;

  if (options.useExactInteractiveColors) {
    // Try to use the user's base color (e.g., the 500 weight they selected)
    const userBaseHex = options.userSelectedPrimaryHex || primaryScale[600].hex;
    const matchedWeight = findScaleWeight(userBaseHex, primaryScale);

    if (matchedWeight) {
      primaryColor = {
        hex: primaryScale[matchedWeight].hex,
        name: `${primaryName}-${matchedWeight}`,
      };

      // Get adaptive states based on the matched weight
      const adaptiveStates = getAdaptiveInteractiveStates(
        primaryScale,
        matchedWeight,
        primaryName
      );
      hoverColor = adaptiveStates.hover;
      activeColor = adaptiveStates.active;
    } else {
      // Fallback to default if no good match
      primaryColor = { hex: primaryScale[600].hex, name: `${primaryName}-600` };
      hoverColor = { hex: primaryScale[500].hex, name: `${primaryName}-500` };
      activeColor = { hex: primaryScale[400].hex, name: `${primaryName}-400` };
    }
  } else {
    // Optimized for interactions (smart positioning with constraints)
    const baseWeight = Math.max(400, Math.min(700, 600)); // Safe range
    primaryColor = {
      hex: primaryScale[baseWeight].hex,
      name: `${primaryName}-${baseWeight}`,
    };

    const adaptiveStates = getAdaptiveInteractiveStates(
      primaryScale,
      baseWeight.toString(),
      primaryName
    );
    hoverColor = adaptiveStates.hover;
    activeColor = adaptiveStates.active;
  }

  // Interactive tokens
  const primaryRgbObj = ColorUtils.hexToRgb(primaryColor.hex);
  const focusLight = primaryRgbObj
    ? `rgba(${primaryRgbObj.r}, ${primaryRgbObj.g}, ${primaryRgbObj.b}, 0.24)`
    : primaryScale[600].hex;
  const focusDark = primaryRgbObj
    ? `rgba(${primaryRgbObj.r}, ${primaryRgbObj.g}, ${primaryRgbObj.b}, 0.36)`
    : primaryScale[400].hex;

  Object.assign(tokens, {
    // Primary
    "interactive-primary": {
      light: primaryColor,
      dark: primaryColor,
    },
    "interactive-primary-hover": {
      light: hoverColor,
      dark: hoverColor,
    },
    "interactive-primary-active": {
      light: activeColor,
      dark: activeColor,
    },

    // Secondary interactive (solid button with inverted colors)
    "interactive-secondary": {
      light: { hex: neutralScale[950].hex, name: `${neutralName}-950` }, // text-primary
      dark: { hex: neutralScale[50].hex, name: `${neutralName}-50` }, // text-primary for dark mode
    },
    "interactive-secondary-hover": {
      light: { hex: neutralScale[900].hex, name: `${neutralName}-900` }, // text-secondary
      dark: { hex: neutralScale[100].hex, name: `${neutralName}-100` }, // text-secondary for dark mode
    },
    "interactive-secondary-active": {
      light: { hex: neutralScale[900].hex, name: `${neutralName}-900` },
      dark: { hex: neutralScale[200].hex, name: `${neutralName}-200` },
    },

    // Tertiary interactive (outline button)
    "interactive-tertiary": {
      light: { hex: "transparent", name: "transparent" },
      dark: { hex: "transparent", name: "transparent" },
    },

    // Focus
    "interactive-focus": {
      light: {
        hex: focusLight,
        name: `${primaryColor.name}-alpha-500`,
      },
      dark: {
        hex: focusDark,
        name: `${primaryColor.name}-alpha-600`,
      },
    },
  });

  // Status colors using constants
  Object.assign(tokens, {
    "success-primary": {
      light: {
        hex: STATUS_COLORS.success.light.primary.hex,
        name: STATUS_COLORS.success.light.primary.name,
      },
      dark: {
        hex: STATUS_COLORS.success.dark.primary.hex,
        name: STATUS_COLORS.success.dark.primary.name,
      },
    },
    "success-background": {
      light: {
        hex: STATUS_COLORS.success.light.background.hex,
        name: STATUS_COLORS.success.light.background.name,
      },
      dark: {
        hex: STATUS_COLORS.success.dark.background.hex,
        name: STATUS_COLORS.success.dark.background.name,
      },
    },
    "success-foreground": {
      light: {
        hex: STATUS_COLORS.success.light.foreground.hex,
        name: STATUS_COLORS.success.light.foreground.name,
      },
      dark: {
        hex: STATUS_COLORS.success.dark.foreground.hex,
        name: STATUS_COLORS.success.dark.foreground.name,
      },
    },
    "success-focus": {
      light: {
        hex: `rgba(${(() => {
          const rgb = ColorUtils.hexToRgb(
            STATUS_COLORS.success.light.foreground.hex
          );
          return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
        })()}, 0.24)`,
        name: `${STATUS_COLORS.success.light.foreground.name}-alpha-500`,
      },
      dark: {
        hex: `rgba(${(() => {
          const rgb = ColorUtils.hexToRgb(
            STATUS_COLORS.success.dark.foreground.hex
          );
          return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
        })()}, 0.36)`,
        name: `${STATUS_COLORS.success.dark.foreground.name}-alpha-600`,
      },
    },

    "warning-primary": {
      light: {
        hex: STATUS_COLORS.warning.light.primary.hex,
        name: STATUS_COLORS.warning.light.primary.name,
      },
      dark: {
        hex: STATUS_COLORS.warning.dark.primary.hex,
        name: STATUS_COLORS.warning.dark.primary.name,
      },
    },
    "warning-background": {
      light: {
        hex: STATUS_COLORS.warning.light.background.hex,
        name: STATUS_COLORS.warning.light.background.name,
      },
      dark: {
        hex: STATUS_COLORS.warning.dark.background.hex,
        name: STATUS_COLORS.warning.dark.background.name,
      },
    },
    "warning-foreground": {
      light: {
        hex: STATUS_COLORS.warning.light.foreground.hex,
        name: STATUS_COLORS.warning.light.foreground.name,
      },
      dark: {
        hex: STATUS_COLORS.warning.dark.foreground.hex,
        name: STATUS_COLORS.warning.dark.foreground.name,
      },
    },
    "warning-focus": {
      light: {
        hex: `rgba(${(() => {
          const rgb = ColorUtils.hexToRgb(
            STATUS_COLORS.warning.light.foreground.hex
          );
          return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
        })()}, 0.24)`,
        name: `${STATUS_COLORS.warning.light.foreground.name}-alpha-500`,
      },
      dark: {
        hex: `rgba(${(() => {
          const rgb = ColorUtils.hexToRgb(
            STATUS_COLORS.warning.dark.foreground.hex
          );
          return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
        })()}, 0.36)`,
        name: `${STATUS_COLORS.warning.dark.foreground.name}-alpha-600`,
      },
    },

    "error-primary": {
      light: {
        hex: STATUS_COLORS.error.light.primary.hex,
        name: STATUS_COLORS.error.light.primary.name,
      },
      dark: {
        hex: STATUS_COLORS.error.dark.primary.hex,
        name: STATUS_COLORS.error.dark.primary.name,
      },
    },
    "error-background": {
      light: {
        hex: STATUS_COLORS.error.light.background.hex,
        name: STATUS_COLORS.error.light.background.name,
      },
      dark: {
        hex: STATUS_COLORS.error.dark.background.hex,
        name: STATUS_COLORS.error.dark.background.name,
      },
    },
    "error-foreground": {
      light: {
        hex: STATUS_COLORS.error.light.foreground.hex,
        name: STATUS_COLORS.error.light.foreground.name,
      },
      dark: {
        hex: STATUS_COLORS.error.dark.foreground.hex,
        name: STATUS_COLORS.error.dark.foreground.name,
      },
    },
    "error-focus": {
      light: {
        hex: `rgba(${(() => {
          const rgb = ColorUtils.hexToRgb(
            STATUS_COLORS.error.light.foreground.hex
          );
          return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
        })()}, 0.24)`,
        name: `${STATUS_COLORS.error.light.foreground.name}-alpha-500`,
      },
      dark: {
        hex: `rgba(${(() => {
          const rgb = ColorUtils.hexToRgb(
            STATUS_COLORS.error.dark.foreground.hex
          );
          return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
        })()}, 0.36)`,
        name: `${STATUS_COLORS.error.dark.foreground.name}-alpha-600`,
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
    baseColors.primary.name,
    {
      useExactInteractiveColors: options.useExactInteractiveColors,
      userSelectedPrimaryHex: baseColors.primary.base,
    }
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

console.log("🎨 Modular Color System v2.0 loaded");
console.log("📋 Available presets:", Object.keys(PRESET_CONFIGS));
console.log("🔒 Presets are immutable and protected from modification");
