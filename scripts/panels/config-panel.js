import { state } from '../core/state.js';
import { cssUpdater } from '../core/css-updater.js';
import { renderer } from '../core/renderer.js';
import { DOMUtils } from '../utils/dom-utils.js';
import { openEnhancedExportModal } from '../export/export-manager.js';
import { PRESET_CONFIGS } from '../color-config.js';

// =============================================================================
// Configuration Panel Management
// =============================================================================

class ConfigPanel {
  constructor() {
    this.panel = document.getElementById('config-panel');
    this.applyFeedbackTimeout = null;
    this.isOpen = false;
    this.scrollPosition = undefined;
    this.init();
  }

  init() {
    if (!this.panel) {
      console.warn('Config Panel: Panel element not found');
      return;
    }

    this.bindEvents();
    this.updateInputs();
  }

  // =============================================================================
  // EVENT BINDING
  // =============================================================================

  bindEvents() {
    // Form elements
    const presetSelect = document.getElementById('preset-select');
    const neutralColorInput = document.getElementById('neutral-color');
    const primaryColorInput = document.getElementById('primary-color');
    const neutralHexInput = document.getElementById('neutral-hex');
    const primaryHexInput = document.getElementById('primary-hex');
    const optimizedContrastToggle = document.getElementById('optimized-contrast-toggle');
    const perceptualToggle = document.getElementById(
      'perceptual-colors-toggle'
    );
    const applyButton = document.getElementById('apply-config');
    const closeButton = document.getElementById('close-config');
    const exportButton = document.getElementById('export-config');

    // Preset selection
    presetSelect?.addEventListener('change', e => this.handlePresetChange(e));

    // Color picker synchronization
    neutralColorInput?.addEventListener('input', e => {
      e.stopPropagation();
      this.handleColorChange(e, 'neutral');
    });
    primaryColorInput?.addEventListener('input', e => {
      e.stopPropagation();
      this.handleColorChange(e, 'primary');
    });
    neutralHexInput?.addEventListener('input', e =>
      this.handleHexChange(e, 'neutral')
    );
    primaryHexInput?.addEventListener('input', e =>
      this.handleHexChange(e, 'primary')
    );

    // Actions
    optimizedContrastToggle?.addEventListener('change', e =>
      this.handleOptimizedContrastToggle(e)
    );

    perceptualToggle?.addEventListener('change', e =>
      this.handlePerceptualToggle(e)
    );

    applyButton?.addEventListener('click', () => this.applyChanges());
    closeButton?.addEventListener('click', () => this.close());
    exportButton?.addEventListener('click', () => this.exportConfig());

    // Close on outside click
    document.addEventListener('click', e => this.handleOutsideClick(e));

    // Enhanced scroll prevention
    this.panel?.addEventListener(
      'touchmove',
      e => {
        if (!e.target.closest('.config-content')) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { passive: false }
    );

    this.panel?.addEventListener(
      'wheel',
      e => {
        if (!e.target.closest('.config-content')) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { passive: false }
    );

    // Update these document listeners:
    document.addEventListener(
      'touchmove',
      e => {
        if (this.isOpen && window.innerWidth <= 768) {
          const exportModal = document.getElementById('exportModal');
          const isInConfigPanel = this.panel?.contains(e.target);
          const isInExportModal = exportModal?.contains(e.target);

          // Only prevent if not in config panel AND not in export modal
          if (!isInConfigPanel && !isInExportModal) {
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );

    document.addEventListener(
      'wheel',
      e => {
        if (this.isOpen && window.innerWidth <= 768) {
          const exportModal = document.getElementById('exportModal');
          const isInConfigPanel = this.panel?.contains(e.target);
          const isInExportModal = exportModal?.contains(e.target);

          if (!isInConfigPanel && !isInExportModal) {
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );
  }

  handleOutsideClick(e) {
    if (
      this.isOpen &&
      !this.panel.contains(e.target) &&
      !document.getElementById('config-toggle')?.contains(e.target)
    ) {
      this.close();
    }
  }

  // =============================================================================
  // PRESET MANAGEMENT
  // =============================================================================

  handlePresetChange(e) {
    const presetName = e.target.value;

    if (presetName !== 'custom') {
      const presetConfig = PRESET_CONFIGS?.[presetName];
      if (presetConfig) {
        this.updateFormWithPreset(presetConfig);
      } else {
        console.warn(`Preset '${presetName}' not found`);
      }
    }
  }

  updateFormWithPreset(presetConfig) {
    const neutralColorInput = document.getElementById('neutral-color');
    const primaryColorInput = document.getElementById('primary-color');
    const neutralHexInput = document.getElementById('neutral-hex');
    const primaryHexInput = document.getElementById('primary-hex');

    if (
      neutralColorInput &&
      primaryColorInput &&
      neutralHexInput &&
      primaryHexInput
    ) {
      const neutralBase = presetConfig.baseColors.neutral.base;
      const primaryBase = presetConfig.baseColors.primary.base;

      neutralColorInput.value = neutralBase;
      primaryColorInput.value = primaryBase;
      neutralHexInput.value = neutralBase;
      primaryHexInput.value = primaryBase;

      this.updateDetectedColors(presetConfig);
    }
  }

  updateDetectedColors(config = null) {
    const detectedColors = document.getElementById('detected-colors');
    if (!detectedColors) return;

    if (config) {
      // Use config data for presets
      const neutralName = config.baseColors.neutral.name;
      const primaryName = config.baseColors.primary.name;
      detectedColors.textContent = `Neutral: ${this.capitalize(
        neutralName
      )}, Primary: ${this.capitalize(primaryName)}`;
    } else {
      // For custom colors, just show generic names
      detectedColors.textContent = 'Neutral: Neutral, Primary: Primary';
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // =============================================================================
  // COLOR INPUT HANDLING
  // =============================================================================

  handleColorChange(e, colorType) {
    const hexInput = document.getElementById(`${colorType}-hex`);
    if (hexInput) {
      hexInput.value = e.target.value;
    }
    this.updateDetectedColors(); // No config = custom mode
    this.setCustomMode();
  }

  handleHexChange(e, colorType) {
    const hexValue = e.target.value;

    // Validate hex format
    if (this.isValidHex(hexValue)) {
      const colorInput = document.getElementById(`${colorType}-color`);
      if (colorInput) {
        colorInput.value = hexValue;
      }
      this.updateDetectedColors(); // No config = custom mode
      this.setCustomMode();
    }
  }

  isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
  }

  setCustomMode() {
    const presetSelect = document.getElementById('preset-select');
    if (presetSelect && presetSelect.value !== 'custom') {
      presetSelect.value = 'custom';
    }
  }

  // =============================================================================
  // FORM UPDATES
  // =============================================================================

  updateInputs() {
    if (!state.activeConfig) {
      console.warn('Config Panel: No active config to update inputs');
      return;
    }

    const presetSelect = document.getElementById('preset-select');
    const neutralColorInput = document.getElementById('neutral-color');
    const primaryColorInput = document.getElementById('primary-color');
    const neutralHexInput = document.getElementById('neutral-hex');
    const primaryHexInput = document.getElementById('primary-hex');
    const optimizedContrastToggle = document.getElementById('optimized-contrast-toggle');
    const perceptualToggle = document.getElementById('perceptual-colors-toggle');

    // Update color inputs
    if (
      neutralColorInput &&
      primaryColorInput &&
      neutralHexInput &&
      primaryHexInput
    ) {
      const neutralBase = state.activeConfig.baseColors.neutral.base;
      const primaryBase = state.activeConfig.baseColors.primary.base;

      neutralColorInput.value = neutralBase;
      primaryColorInput.value = primaryBase;
      neutralHexInput.value = neutralBase;
      primaryHexInput.value = primaryBase;
    }

    // Update preset selection
    if (presetSelect) {
      const matchingPreset = this.findMatchingPreset(state.activeConfig);
      presetSelect.value = matchingPreset;
    }

    if (optimizedContrastToggle) {
      optimizedContrastToggle.checked =
        state.activeConfig?.options?.useOptimizedContrast || false;
    }

    if (perceptualToggle) {
      perceptualToggle.checked =
        state.activeConfig?.options?.usePerceptualColors || false;
    }

    // Update detected colors display
    this.updateDetectedColorsFromState();
  }

  findMatchingPreset(currentConfig) {
    // Check if it's a known preset
    for (const [presetName, presetConfig] of Object.entries(
      PRESET_CONFIGS || {}
    )) {
      if (this.configsMatch(currentConfig, presetConfig)) {
        return presetName;
      }
    }

    // Default to custom if no match
    return 'custom';
  }

  configsMatch(config1, config2) {
    return (
      config1.baseColors.neutral.base === config2.baseColors.neutral.base &&
      config1.baseColors.primary.base === config2.baseColors.primary.base &&
      config1.baseColors.neutral.name === config2.baseColors.neutral.name &&
      config1.baseColors.primary.name === config2.baseColors.primary.name
    );
  }

  updateDetectedColorsFromState() {
    const detectedColors = document.getElementById('detected-colors');
    if (!detectedColors || !state.activeConfig) return;

    const neutralName = state.activeConfig.baseColors.neutral.name;
    const primaryName = state.activeConfig.baseColors.primary.name;
    detectedColors.textContent = `Neutral: ${this.capitalize(
      neutralName
    )}, Primary: ${this.capitalize(primaryName)}`;
  }

  // =============================================================================
  // CONFIG TOGGLES
  // =============================================================================

  handleOptimizedContrastToggle(e) {
    // This will trigger when user changes the checkbox
    // The actual state change will happen when they click "Apply Changes"
    console.log('Exact colors toggle changed:', e.target.checked);
  }

  handlePerceptualToggle(e) {
    // This will trigger when user changes the checkbox
    console.log('Perceptual colors toggle changed:', e.target.checked);
  }

  // =============================================================================
  // APPLY CHANGES
  // =============================================================================

  applyChanges() {
    const presetSelect = document.getElementById('preset-select');
    const neutralColorInput = document.getElementById('neutral-color');
    const primaryColorInput = document.getElementById('primary-color');
    const optimizedContrastToggle = document.getElementById('optimized-contrast-toggle');
    const perceptualToggle = document.getElementById('perceptual-colors-toggle');

    if (!presetSelect) {
      console.error('Config Panel: Preset select not found');
      return;
    }

    const useOptimizedContrast = optimizedContrastToggle?.checked || false;
    const usePerceptualColors = perceptualToggle?.checked || false;

    try {
      if (presetSelect.value !== 'custom') {
        // Load preset
        const success = state.loadPreset(presetSelect.value);
        if (!success) {
          console.error(`Failed to load preset: ${presetSelect.value}`);
          return;
        }

        if (success && state.activeConfig) {
          state.activeConfig.options.useOptimizedContrast = useOptimizedContrast;
          state.activeConfig.options.usePerceptualColors = usePerceptualColors;
          state.activeConfig.options.colorGenerationMethod = usePerceptualColors ? 'lab' : 'hsl';
          state.updateColorSystem(state.activeConfig);
        }
      } else {
        // Apply custom colors
        if (!neutralColorInput || !primaryColorInput) {
          console.error('Config Panel: Color inputs not found');
          return;
        }

        if (
          !this.isValidHex(neutralColorInput.value) ||
          !this.isValidHex(primaryColorInput.value)
        ) {
          console.error('Config Panel: Invalid hex colors');
          DOMUtils.showFeedback('Invalid color values', 'error');
          return;
        }

        const success = state.setCustomColors(
          neutralColorInput.value,
          primaryColorInput.value,
          {
            useOptimizedContrast: useOptimizedContrast,
            usePerceptualColors: usePerceptualColors,
            colorGenerationMethod: usePerceptualColors ? 'lab' : 'hsl',
          }
        );
        if (!success) {
          console.error('Failed to set custom colors');
          return;
        }
      }

      // Update the entire system
      cssUpdater.updateVariables();
      renderer.renderInterface();
      this.showApplyFeedback();

      console.log('✅ Config changes applied successfully');
    } catch (error) {
      console.error('❌ Error applying config changes:', error);
      DOMUtils.showFeedback('Failed to apply changes', 'error');
    }
  }

  showApplyFeedback() {
    const applyButton = document.getElementById('apply-config');
    if (!applyButton) return;

    // Clear any existing timeout
    if (this.applyFeedbackTimeout) {
      clearTimeout(this.applyFeedbackTimeout);
    }

    // Reset to original state
    applyButton.classList.remove('applied');
    applyButton.textContent = 'Apply Changes';
    applyButton.offsetHeight; // Force reflow

    // Apply feedback state
    applyButton.classList.add('applied');
    applyButton.textContent = 'Applied!';

    // Reset after delay
    this.applyFeedbackTimeout = setTimeout(() => {
      applyButton.classList.remove('applied');
      applyButton.textContent = 'Apply Changes';
      this.applyFeedbackTimeout = null;
    }, 1500);
  }

  // =============================================================================
  // PANEL VISIBILITY
  // =============================================================================

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.panel) return;

    // Store scroll position BEFORE any DOM changes
    this.scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    // Always ensure the panel is visible before animation
    this.panel.style.display = 'flex';

    // Only on desktop, prepare for animation by removing show class
    if (window.innerWidth > 768) {
      this.panel.classList.remove('show');
      this.panel.offsetHeight; // Force reflow
    }

    // Add the show class to trigger animation
    requestAnimationFrame(() => {
      this.panel.classList.add('show');
    });

    this.isOpen = true;

    // Prevent body scroll on mobile
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${this.scrollPosition}px`;
    }

    // Update inputs when opening
    this.updateInputs();

    console.log('⚙️ Config panel opened');
  }

  close() {
    if (!this.panel) return;

    this.panel.classList.remove('show');
    this.isOpen = false;

    // Handle animation timing for both desktop and mobile
    const transitionDuration = window.innerWidth > 768 ? 200 : 300; // --transition-fast vs --transition-normal

    setTimeout(() => {
      if (!this.isOpen) {
        // Double-check it's still closed
        // Reset display on desktop
        if (window.innerWidth > 768) {
          this.panel.style.display = 'none';
        }

        // Restore body scroll on mobile (after animation completes)
        if (window.innerWidth <= 768) {
          const scrollY = this.scrollPosition;

          // Remove fixed positioning
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.top = '';

          // Restore scroll position
          window.scrollTo(0, scrollY);
          this.scrollPosition = undefined;
        }
      }
    }, transitionDuration);

    console.log('⚙️ Config panel closed');
  }

  // =============================================================================
  // EXPORT FUNCTIONALITY
  // =============================================================================

  exportConfig() {
    openEnhancedExportModal();
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Get current form values
  getCurrentFormValues() {
    const presetSelect = document.getElementById('preset-select');
    const neutralHex = document.getElementById('neutral-hex');
    const primaryHex = document.getElementById('primary-hex');

    return {
      preset: presetSelect?.value || 'custom',
      neutralHex: neutralHex?.value || '#71717a',
      primaryHex: primaryHex?.value || '#3b82f6',
    };
  }

  // Validate current form state
  validateForm() {
    const values = this.getCurrentFormValues();

    if (values.preset === 'custom') {
      return (
        this.isValidHex(values.neutralHex) && this.isValidHex(values.primaryHex)
      );
    }

    return true; // Presets are always valid
  }

  // Reset form to current state
  resetForm() {
    this.updateInputs();
    console.log('🔄 Config form reset');
  }

  // Check if panel is ready
  isReady() {
    return !!this.panel && state.isInitialized();
  }

  // Cleanup method
  cleanup() {
    if (this.applyFeedbackTimeout) {
      clearTimeout(this.applyFeedbackTimeout);
      this.applyFeedbackTimeout = null;
    }
  }
}

const configPanel = new ConfigPanel();
export { configPanel };
