import { ColorUtils } from '../utils/color-utils.js';
import { initializeColorSystem, PRESET_CONFIGS } from '../color-config.js';

// =============================================================================
// Color System State Management
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
        neutral: { name: 'zinc', base: '#71717a', hex: '#71717a' },
        primary: { name: 'blue', base: '#3b82f6', hex: '#3b82f6' },
      },
      project: {
        name: 'Semantic Color Design System',
        description:
          'A comprehensive color system built on primitive colors with semantic tokens for consistent, accessible design',
      },
      options: {
        autoDetectColorNames: true,
        generateFullScale: true,
        includeAlphaColors: true,
        includeStatusColors: true,
        includeFamilyContrast: true,
        useSmartPositioning: true,
        useOptimizedContrast: false,
        colorGenerationMethod: 'oklch', // Default to OKLCH
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
      console.error('Failed to update color system:', error);
      return false;
    }
  }

  loadPreset(presetName) {
    if (!PRESET_CONFIGS?.[presetName]) {
      console.warn(`Preset '${presetName}' not found`);
      return false;
    }

    const presetConfig = JSON.parse(JSON.stringify(PRESET_CONFIGS[presetName]));
    const newConfig = {
      ...this.getDefaultConfig(),
      ...presetConfig,
      options: { ...this.getDefaultConfig().options, ...presetConfig.options },
    };

    return this.updateColorSystem(newConfig);
  }

  setCustomColors(neutralHex, primaryHex, additionalOptions = {}) {
    const customConfig = JSON.parse(JSON.stringify(this.activeConfig));

    customConfig.baseColors.neutral.base = neutralHex;
    customConfig.baseColors.neutral.hex = neutralHex;
    customConfig.baseColors.neutral.name = 'neutral';

    customConfig.baseColors.primary.base = primaryHex;
    customConfig.baseColors.primary.hex = primaryHex;
    customConfig.baseColors.primary.name = 'primary';

    // Update project name for custom colors
    customConfig.project.name = 'Custom Design System';

    customConfig.options.autoDetectColorNames = false;

    // Merge additional options
    Object.assign(customConfig.options, additionalOptions);

    return this.updateColorSystem(customConfig);
  }

  // Getters for easy access to current state
  getCurrentNeutralName() {
    return this.currentColorSystem?.meta?.neutralName || 'neutral';
  }

  getCurrentPrimaryName() {
    return this.currentColorSystem?.meta?.primaryName || 'primary';
  }

  getCurrentNeutralBase() {
    return this.activeConfig?.baseColors?.neutral?.base;
  }

  getCurrentPrimaryBase() {
    return this.activeConfig?.baseColors?.primary?.base;
  }

  // Helper methods for color utilities
  isMainColor(hex, colorFamily) {
    const baseColor =
      colorFamily === this.getCurrentNeutralName()
        ? this.getCurrentNeutralBase()
        : this.getCurrentPrimaryBase();
    return hex.toLowerCase() === baseColor?.toLowerCase();
  }

  isUserSelectedColor(hex, colorFamily) {
    const baseColor =
      colorFamily === this.getCurrentNeutralName()
        ? this.getCurrentNeutralBase()
        : this.getCurrentPrimaryBase();

    return hex.toLowerCase() === baseColor?.toLowerCase();
  }

  isFunctionalColor(hex, colorFamily) {
    // Only check for primary colors since neutral doesn't have functional colors
    if (colorFamily !== this.getCurrentPrimaryName()) {
      return false;
    }

    // Check if this hex matches the interactive-primary color
    const interactivePrimary = this.semanticTokens?.['interactive-primary'];
    if (interactivePrimary) {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') || 'light';
      return (
        hex.toLowerCase() ===
        interactivePrimary[currentTheme]?.hex?.toLowerCase()
      );
    }

    return false;
  }

  getContrastInfo(hex, colorFamily) {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) {
      return {
        aaWhite: false,
        aaBlack: false,
        aaaWhite: false,
        aaaBlack: false,
        family: {},
      };
    }

    // Convert to array format for the contrast calculation functions
    const rgbArray = [rgb.r, rgb.g, rgb.b];
    const whiteContrast = ColorUtils.getContrastRatio(
      rgbArray,
      [255, 255, 255]
    );
    const blackContrast = ColorUtils.getContrastRatio(rgbArray, [0, 0, 0]);

    let familyContrasts = {};
    const currentColors =
      colorFamily === this.getCurrentNeutralName()
        ? this.neutralColors
        : this.primaryColors;

    if (currentColors) {
      Object.entries(currentColors).forEach(([weight, colorData]) => {
        const shadeRgb = ColorUtils.hexToRgb(colorData.hex);
        if (shadeRgb) {
          const contrast = ColorUtils.getContrastRatio(rgbArray, [
            shadeRgb.r,
            shadeRgb.g,
            shadeRgb.b,
          ]);
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
  }

  // Validation methods
  isInitialized() {
    return this.currentColorSystem !== null;
  }

  hasValidConfig() {
    return (
      this.activeConfig &&
      this.activeConfig.baseColors &&
      this.activeConfig.baseColors.neutral &&
      this.activeConfig.baseColors.primary
    );
  }

  // Debug helpers
  getDebugInfo() {
    return {
      initialized: this.isInitialized(),
      validConfig: this.hasValidConfig(),
      neutralName: this.getCurrentNeutralName(),
      primaryName: this.getCurrentPrimaryName(),
      neutralBase: this.getCurrentNeutralBase(),
      primaryBase: this.getCurrentPrimaryBase(),
      colorCount: {
        neutral: Object.keys(this.neutralColors).length,
        primary: Object.keys(this.primaryColors).length,
        semantic: Object.keys(this.semanticTokens).length,
      },
    };
  }
}

export const state = new ColorSystemState();
