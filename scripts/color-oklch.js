import * as culori from 'https://cdn.jsdelivr.net/npm/culori@3/+esm';
import { APCAcontrast, sRGBtoY } from 'https://cdn.skypack.dev/apca-w3@0.1.9';
import { capitalize } from './utils/object-utils.js';

// =============================================================================
// OKLCH-based Color Generation (Modern Perceptual Color Space)
// =============================================================================

/**
 * Generate perceptually uniform color scale using OKLCH color space
 * OKLCH provides better perceptual uniformity than CIELAB and supports wider gamut
 *
 * @param {string} baseHex - Base hex color
 * @param {string} colorName - Name for the color family
 * @param {Object} options - Generation options
 * @returns {Object} Color scale object
 */
export function generateColorScaleOKLCH(baseHex, colorName, options = {}) {
  try {
    const { oklch, formatHex, clampChroma, parse } = culori;

    // Parse the base color
    const baseColor = parse(baseHex);
    if (!baseColor) {
      console.error('Invalid hex color:', baseHex);
      return null;
    }

    // Convert to OKLCH
    const baseOKLCH = oklch(baseColor);

    // Define the target lightness values for each weight (0-1 scale)
    const targetLightness = {
      50: 0.99, // Almost white (very subtle tint)
      100: 0.97, // Very light
      200: 0.93, // Light
      300: 0.87, // Light-medium
      400: 0.77, // Medium-light
      500: 0.65, // True middle
      600: 0.53, // Medium-dark
      700: 0.42, // Dark
      800: 0.31, // Very dark
      900: 0.22, // Extremely dark
      950: 0.15, // Almost black
    };

    let lightnessCurve;
    let basePosition = 500; // Default position

    if (options.useOptimizedContrast) {
      // Use fixed optimal lightness curve
      lightnessCurve = { ...targetLightness };
    } else {
      // Smart positioning: find where user's color best fits
      const userLightness = baseOKLCH.l;
      let closestDiff = Infinity;
      let closestWeight = 500;

      Object.entries(targetLightness).forEach(([weight, lightness]) => {
        const diff = Math.abs(userLightness - lightness);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestWeight = parseInt(weight);
        }
      });

      basePosition = closestWeight;

      // Build lightness curve with user's color positioned correctly
      lightnessCurve = { ...targetLightness };
      lightnessCurve[basePosition] = userLightness;
    }

    const scale = {};

    Object.entries(lightnessCurve).forEach(([weight, targetLightnessValue]) => {
      let chromaValue, hue;

      // Handle potential undefined/NaN values from base color
      if (
        baseOKLCH.c === undefined ||
        isNaN(baseOKLCH.c) ||
        baseOKLCH.c === 0
      ) {
        // For achromatic colors (grays), use minimal chroma
        chromaValue = 0;
        hue = 0;
      } else {
        chromaValue = baseOKLCH.c;
        hue = baseOKLCH.h || 0;
      }

      let finalLightness = targetLightnessValue;
      let adjustedChroma = chromaValue;

      // For the positioned user color, use exact values
      if (!options.useOptimizedContrast && parseInt(weight) === basePosition) {
        finalLightness = baseOKLCH.l;
        adjustedChroma = baseOKLCH.c || 0;
        hue = baseOKLCH.h || 0;
      } else {
        // Adjust chroma based on lightness for better vibrancy and gamut fit
        if (options.useOptimizedContrast) {
          // More aggressive chroma reduction for optimal contrast
          if (finalLightness > 0.85) {
            adjustedChroma = Math.max(chromaValue * 0.3, 0.02);
          } else if (finalLightness > 0.7) {
            adjustedChroma = chromaValue * 0.7;
          } else if (finalLightness < 0.25) {
            adjustedChroma = chromaValue * 0.8;
          }
        } else {
          // Gentler chroma adjustments to preserve color character
          if (finalLightness > 0.85) {
            adjustedChroma = Math.max(chromaValue * 0.4, 0.015);
          } else if (finalLightness > 0.7) {
            adjustedChroma = chromaValue * 0.8;
          } else if (finalLightness < 0.2) {
            adjustedChroma = chromaValue * 0.7;
          }
        }
      }

      // Create color using OKLCH
      const color = {
        mode: 'oklch',
        l: finalLightness,
        c: adjustedChroma,
        h: hue || 0,
      };

      // Apply gamut mapping with chroma clamping (preserves hue better)
      const clampedColor = clampChroma(color, 'oklch');

      // Convert to hex
      let hex;
      try {
        hex = formatHex(clampedColor);
      } catch (error) {
        console.warn(
          `Failed to convert OKLCH to hex for weight ${weight}:`,
          error
        );
        // Fallback: try direct conversion without clamping
        hex = formatHex(color);
      }

      scale[weight] = {
        hex: hex,
        name: `${capitalize(colorName)} ${weight}`,
        oklch: {
          l: finalLightness,
          c: adjustedChroma,
          h: hue || 0,
        },
      };
    });

    return scale;
  } catch (error) {
    console.error('OKLCH color generation failed:', error);
    return null;
  }
}

/**
 * Enhanced color detection using OKLCH color space
 * More accurate than HSL for perceptual color matching
 *
 * @param {string} hex - Hex color string
 * @returns {string} Detected color name or "custom"
 */
export function detectColorNameOKLCH(hex) {
  try {
    const { oklch, parse } = culori;

    const color = parse(hex);
    if (!color) return 'custom';

    const colorOKLCH = oklch(color);

    const lightness = colorOKLCH.l;
    const chromaValue = colorOKLCH.c;
    const hue = colorOKLCH.h;

    // For very low chroma, it's a neutral
    if (chromaValue === undefined || isNaN(chromaValue) || chromaValue < 0.02) {
      if (lightness > 0.5) return 'neutral';
      return 'gray';
    }

    // Enhanced hue detection using perceptual boundaries
    const hueRanges = {
      red: [0, 30, 330, 360],
      orange: [30, 60],
      yellow: [60, 90],
      green: [90, 150],
      teal: [150, 180],
      cyan: [180, 210],
      blue: [210, 270],
      purple: [270, 300],
      pink: [300, 330],
    };

    if (hue === undefined || isNaN(hue)) {
      return 'custom';
    }

    for (const [colorName, ranges] of Object.entries(hueRanges)) {
      if (ranges.length === 4) {
        // Handles red wraparound
        if (
          (hue >= ranges[0] && hue <= ranges[1]) ||
          (hue >= ranges[2] && hue <= ranges[3])
        ) {
          return colorName;
        }
      } else {
        if (hue >= ranges[0] && hue <= ranges[1]) {
          return colorName;
        }
      }
    }

    return 'custom';
  } catch (error) {
    console.warn('OKLCH color detection failed:', error);
    return 'custom';
  }
}

/**
 * Calculate perceptual contrast using OKLCH-based difference
 * More accurate than RGB-based contrast calculations
 *
 * @param {string} color1Hex - First color hex
 * @param {string} color2Hex - Second color hex
 * @returns {Object} Contrast information
 */
export function calculatePerceptualContrastOKLCH(color1Hex, color2Hex) {
  try {
    const { oklch, parse } = culori;

    const color1 = oklch(parse(color1Hex));
    const color2 = oklch(parse(color2Hex));

    if (!color1 || !color2) {
      return { deltaE: 0, approximateRatio: 1, isAccessible: false };
    }

    // Calculate Euclidean distance in OKLCH space
    const deltaL = color1.l - color2.l;
    const deltaC = (color1.c || 0) - (color2.c || 0);
    const deltaH = (color1.h || 0) - (color2.h || 0);

    // Normalize hue difference (handle wraparound)
    const normalizedDeltaH = Math.min(Math.abs(deltaH), 360 - Math.abs(deltaH));

    // Calculate perceptual difference
    const deltaE = Math.sqrt(
      Math.pow(deltaL * 100, 2) +
      Math.pow(deltaC * 100, 2) +
      Math.pow(normalizedDeltaH / 360, 2)
    );

    // Convert to approximate contrast ratio
    const approximateRatio = Math.max(1, deltaE / 10);

    return {
      deltaE: deltaE,
      approximateRatio: approximateRatio,
      isAccessible: deltaE > 40, // Rough threshold for accessibility
    };
  } catch (error) {
    console.warn('Perceptual contrast calculation failed:', error);
    return { deltaE: 0, approximateRatio: 1, isAccessible: false };
  }
}

/**
 * Calculate APCA (Accessible Perceptual Contrast Algorithm) contrast
 * Used for WCAG 3.0 contrast assessment
 *
 * @param {string} foregroundHex - Foreground color hex
 * @param {string} backgroundHex - Background color hex
 * @returns {number|null} APCA Lc value (absolute), or null if calculation fails
 */
export function calculateAPCA(foregroundHex, backgroundHex) {
  try {
    const { rgb } = culori;

    // Parse colors to RGB
    const fgRgb = rgb(foregroundHex);
    const bgRgb = rgb(backgroundHex);

    if (!fgRgb || !bgRgb) {
      console.warn('APCA: Invalid color input');
      return null;
    }

    // Convert to 0-255 range with alpha channel for APCA library
    // Format: [R, G, B, A] where RGB is 0-255 and A is 0.0-1.0
    const fg = [
      Math.round(fgRgb.r * 255),
      Math.round(fgRgb.g * 255),
      Math.round(fgRgb.b * 255),
      1.0, // Alpha (fully opaque)
    ];
    const bg = [
      Math.round(bgRgb.r * 255),
      Math.round(bgRgb.g * 255),
      Math.round(bgRgb.b * 255),
      1.0, // Alpha (fully opaque)
    ];

    // Convert RGB to luminance Y values, then calculate APCA contrast
    // APCAcontrast expects Y values, not raw RGB
    const Lc = APCAcontrast(sRGBtoY(fg), sRGBtoY(bg));

    // Return absolute value, rounded
    return Math.round(Math.abs(Lc));
  } catch (error) {
    console.warn('APCA calculation failed:', error);
    return null;
  }
}
