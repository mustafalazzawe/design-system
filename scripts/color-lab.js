import { capitalize } from './utils/object-utils.js';

// =============================================================================
// CIELAB-based Color Generation (Contentful's approach)
// =============================================================================

/**
 * Generate perceptually uniform color scale using CIELAB color space
 * @param {string} baseHex - Base hex color
 * @param {string} colorName - Name for the color family
 * @returns {Object} Color scale object
 */
export function generateColorScaleLAB(baseHex, colorName) {
  try {
    const base = chroma(baseHex);
    // Use .get() method for CDN version
    const baseLCH = [base.get('lch.l'), base.get('lch.c'), base.get('lch.h')];

    // Perceptually uniform lightness curve
    // Based on Contentful's research for optimal contrast ratios
    const lightnessCurve = {
      50: 96, // Very light
      100: 92, // Light
      200: 84, // Light-medium
      300: 74, // Medium-light
      400: 64, // Medium
      500: baseLCH[0] || 50, // Base color lightness
      600: Math.max(baseLCH[0] - 15, 35), // Darker
      700: Math.max(baseLCH[0] - 25, 25), // Much darker
      800: Math.max(baseLCH[0] - 35, 15), // Very dark
      900: Math.max(baseLCH[0] - 45, 8), // Extremely dark
      950: 5, // Almost black
    };

    const scale = {};

    Object.entries(lightnessCurve).forEach(([weight, targetLightness]) => {
      let chromaValue, hue;

      // Handle potential NaN values from base color
      if (isNaN(baseLCH[1]) || isNaN(baseLCH[2])) {
        // For achromatic colors (grays), use minimal chroma
        chromaValue = 0;
        hue = 0;
      } else {
        chromaValue = baseLCH[1];
        hue = baseLCH[2];
      }

      // Adjust chroma based on lightness for better vibrancy
      let adjustedChroma = chromaValue;

      // Boost chroma for lighter colors to maintain vibrancy
      if (targetLightness > 70) {
        adjustedChroma = Math.min(chromaValue * 1.2, 100);
      }
      // Reduce chroma for very dark colors to avoid muddy appearance
      else if (targetLightness < 20) {
        adjustedChroma = chromaValue * 0.8;
      }

      // Create color using chroma.lch() constructor
      const color = chroma.lch(targetLightness, adjustedChroma, hue || 0);

      // Ensure valid hex output
      let hex;
      try {
        hex = color.hex();
      } catch (error) {
        // Fallback to clamped color if out of gamut
        hex = color.clamp().hex();
      }

      scale[weight] = {
        hex: hex,
        name: `${capitalize(colorName)} ${weight}`, // Add capitalize here
        lab: {
          l: targetLightness,
          c: adjustedChroma,
          h: hue || 0,
        },
      };
    });

    return scale;
  } catch (error) {
    console.error('LAB color generation failed:', error);
    return null;
  }
}

/**
 * Enhanced color detection using LAB color space
 * More accurate than HSL for perceptual color matching
 */
export function detectColorNameLAB(hex) {
  try {
    const color = chroma(hex);
    // Use .get() method for CDN version
    const lightness = color.get('lch.l');
    const chromaValue = color.get('lch.c');
    const hue = color.get('lch.h');

    // For very low chroma, it's a neutral
    if (isNaN(chromaValue) || chromaValue < 8) {
      if (lightness > 50) return 'neutral';
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
    console.warn('LAB color detection failed:', error);
    return 'custom';
  }
}

/**
 * Calculate perceptual contrast using CIELAB Delta E
 * More accurate than RGB-based contrast calculations
 */
export function calculatePerceptualContrast(color1Hex, color2Hex) {
  try {
    const color1 = chroma(color1Hex);
    const color2 = chroma(color2Hex);

    // Use deltaE method if available, otherwise fallback to simple calculation
    let deltaE;
    if (typeof chroma.deltaE === 'function') {
      deltaE = chroma.deltaE(color1, color2);
    } else {
      // Simple Delta E approximation using Lab values
      const lab1 = [
        color1.get('lab.l'),
        color1.get('lab.a'),
        color1.get('lab.b'),
      ];
      const lab2 = [
        color2.get('lab.l'),
        color2.get('lab.a'),
        color2.get('lab.b'),
      ];

      deltaE = Math.sqrt(
        Math.pow(lab1[0] - lab2[0], 2) +
          Math.pow(lab1[1] - lab2[1], 2) +
          Math.pow(lab1[2] - lab2[2], 2)
      );
    }

    // Convert Delta E to approximate contrast ratio
    // This is a rough approximation for compatibility
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
