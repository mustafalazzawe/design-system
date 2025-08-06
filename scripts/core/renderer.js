import { state } from './state.js';
import { themeManager } from './theme-manager.js';
import { ColorUtils } from '../utils/color-utils.js';
import { DOMUtils } from '../utils/dom-utils.js';

// =============================================================================
// Tooltip Manager
// =============================================================================
class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.currentTarget = null;
    this.isVisible = false;
  }

  // Create or get the global tooltip
  getTooltip() {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'global-tooltip';
      this.tooltip.innerHTML = `
        <div class="tooltip-content">
          <!-- Content populated dynamically -->
        </div>
      `;
      document.body.appendChild(this.tooltip);
    }
    return this.tooltip;
  }

  // Show tooltip with custom content
  show(content, e) {
    const tooltip = this.getTooltip();
    const contentEl = tooltip.querySelector('.tooltip-content');

    // Handle different content types
    if (typeof content === 'string') {
      contentEl.innerHTML = content;
    } else if (content.html) {
      contentEl.innerHTML = content.html;
    } else {
      // Handle structured content
      contentEl.innerHTML = this.renderContent(content);
    }

    // Ensure tooltip is visible
    tooltip.style.display = 'block';
    tooltip.classList.add('show');
    this.isVisible = true;

    // Position after showing to get accurate dimensions
    setTimeout(() => {
      this.position(e);
    }, 0);
  }

  // Position tooltip
  position(e) {
    if (!this.tooltip || !this.isVisible) return;

    const tooltip = this.getTooltip();

    // Force a layout calculation to get accurate dimensions
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';

    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = e.clientX + 15; // Offset from cursor
    let y = e.clientY - tooltipRect.height / 2;

    // Horizontal bounds checking
    if (x + tooltipRect.width > viewportWidth - 10) {
      x = e.clientX - tooltipRect.width - 15;
    }

    // Vertical bounds checking
    if (y < 10) {
      y = 10;
    } else if (y + tooltipRect.height > viewportHeight - 10) {
      y = viewportHeight - tooltipRect.height - 10;
    }

    // Apply position and show
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.style.visibility = 'visible';
  }

  // Hide tooltip
  hide() {
    if (this.tooltip) {
      this.tooltip.classList.remove('show');
    }
    this.isVisible = false;
    this.currentTarget = null;
  }

  // Render different content types
  renderContent(content) {
    switch (content.type) {
      case 'contrast':
        return this.renderContrastContent(content);
      case 'badge':
        return this.renderBadgeContent(content);
      case 'simple':
        return `<div class="tooltip-simple">${content.text}</div>`;
      default:
        return content.html || '';
    }
  }

  renderContrastContent(content) {
    const { hex, bestFamilyMatch } = content.data;
    return `
      <div class="tooltip-header">Contrast Ratio</div>
      <div class="tooltip-ratio">${bestFamilyMatch.ratio.toFixed(2)}</div>
      <div class="tooltip-colors">
        <div class="tooltip-color">
          <div class="tooltip-color-swatch" style="background-color: ${hex};"></div>
          <span>${hex.toUpperCase()}</span>
        </div>
        <div class="tooltip-vs">vs</div>
        <div class="tooltip-color">
          <div class="tooltip-color-swatch" style="background-color: ${bestFamilyMatch.hex};"></div>
          <span>${bestFamilyMatch.hex.toUpperCase()}</span>
        </div>
      </div>
      <div class="tooltip-standards">
        <div class="tooltip-standard ${bestFamilyMatch.ratio >= 4.5 ? 'pass' : 'fail'}">
          <span class="standard-icon">${bestFamilyMatch.ratio >= 4.5 ? '✓' : '✕'}</span>
          AA ${bestFamilyMatch.ratio >= 4.5 ? 'Pass' : 'Fail'}
        </div>
        <div class="tooltip-standard ${bestFamilyMatch.ratio >= 7.0 ? 'pass' : 'fail'}">
          <span class="standard-icon">${bestFamilyMatch.ratio >= 7.0 ? '✓' : '✕'}</span>
          AAA ${bestFamilyMatch.ratio >= 7.0 ? 'Pass' : 'Fail'}
        </div>
      </div>
    `;
  }

  renderBadgeContent(content) {
    return `
      <div class="tooltip-badge">
        <div class="tooltip-badge-title">${content.data.title}</div>
        <div class="tooltip-badge-description">${content.data.description}</div>
      </div>
    `;
  }

  // Cleanup
  cleanup() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }
}

// =============================================================================
// Rendering System
// =============================================================================

class Renderer {
  constructor() {
    this.isRendering = false;
    this.tooltipManager = new TooltipManager();
  }

  // =============================================================================
  // HELPERS
  // =============================================================================

  getContrastTextColor(backgroundHex) {
    const isLight = ColorUtils.isLightColor(backgroundHex);
    return isLight
      ? state.neutralColors[950]?.hex || '#18181b' // Dark text on light background
      : state.neutralColors[50]?.hex || '#fafafa'; // Light text on dark background
  }

  // =============================================================================
  // PAGE METADATA UPDATES
  // =============================================================================

  updatePageMetadata() {
    if (!state.currentColorSystem) {
      console.warn('Renderer: Cannot update metadata - no color system');
      return;
    }

    const titleElement = document.querySelector('h1');
    const subtitleElement = document.querySelector('.subtitle');
    const neutralTitle = document.getElementById('neutral-section-title');
    const primaryTitle = document.getElementById('primary-section-title');

    if (titleElement) {
      titleElement.textContent =
        state.currentColorSystem.config.project?.name ||
        'Semantic Color Design System';
    }

    if (subtitleElement) {
      subtitleElement.textContent =
        state.currentColorSystem.config.project?.description ||
        'A comprehensive color system built on primitive colors with semantic tokens for consistent, accessible design';
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
    const contrast = state.getContrastInfo(hex, colorFamily);
    const isUserSelectedColor = state.isUserSelectedColor(hex, colorFamily);
    const isFunctionalColor = state.isFunctionalColor(hex, colorFamily);

    // Find best family contrast match for display
    let bestFamilyMatch = null;
    for (const [shade, info] of Object.entries(contrast.family)) {
      if (info.aa && (!bestFamilyMatch || info.ratio > bestFamilyMatch.ratio)) {
        bestFamilyMatch = {
          shade: `${colorFamily}-${shade}`,
          ratio: info.ratio,
          hex: info.hex,
        };
      }
    }

    // Fallback: if no family match found, use white/black contrast
    if (!bestFamilyMatch) {
      const whiteContrast = contrast.white || 1;
      const blackContrast = contrast.black || 1;

      if (whiteContrast >= blackContrast) {
        bestFamilyMatch = {
          shade: 'white',
          ratio: whiteContrast,
          hex: '#ffffff',
        };
      } else {
        bestFamilyMatch = {
          shade: 'black',
          ratio: blackContrast,
          hex: '#000000',
        };
      }
    }

    const card = document.createElement('div');
    card.className = 'primitive-card';

    // Format contrast ratio display
    let contrastLabel = '';
    if (bestFamilyMatch) {
      const ratio = bestFamilyMatch.ratio;
      if (ratio >= 7.0) {
        contrastLabel = `AAA ${ratio.toFixed(2)}`;
      } else if (ratio >= 4.5) {
        contrastLabel = `AA ${ratio.toFixed(2)}`;
      } else {
        contrastLabel = ratio.toFixed(2);
      }
    }

    // Use bestFamilyMatch color for text
    const contrastTextColor = bestFamilyMatch.hex;

    // Create badge HTML only if badges exist
    const badgesHtml =
      isUserSelectedColor || isFunctionalColor
        ? `
    <div class="card-badges">
      ${isUserSelectedColor ? '<div class="card-indicator-badge badge-selected" data-tooltip-type="badge" data-tooltip-title="Selected" data-tooltip-description="This color was chosen as the base color for this family">S</div>' : ''}
      ${isFunctionalColor ? '<div class="card-indicator-badge badge-functional" data-tooltip-type="badge" data-tooltip-title="Functional" data-tooltip-description="This color is used in interactive components like buttons">F</div>' : ''}
    </div>
  `
        : '';

    card.innerHTML = `
    <div class="card-color" style="background-color: ${hex};">
      ${badgesHtml}
      <button class="card-copy-btn card-action-btn interactive-base">
        Copy
      </button>
      <div class="contrast-display" style="color: ${contrastTextColor};" 
           data-tooltip-type="contrast"
           data-hex="${hex}"
           data-contrast-hex="${bestFamilyMatch.hex}"
           data-contrast-ratio="${bestFamilyMatch.ratio}">
        ${contrastLabel}
      </div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <div class="card-name">${name}</div>
        <div class="card-hex">${hex.toUpperCase()}</div>
      </div>
    </div>
  `;

    // Add event listeners
    this.attachCardEventListeners(card, hex, bestFamilyMatch);
    return card;
  }

  attachCardEventListeners(card, hex, bestFamilyMatch) {
    const copyBtn = card.querySelector('.card-copy-btn');

    // Initialize cleanup array
    card._cleanupListeners = card._cleanupListeners || [];

    // Universal tooltip handler - need to bind 'this' context properly
    const tooltipElements = card.querySelectorAll('[data-tooltip-type]');

    tooltipElements.forEach(element => {
      // Bind the tooltip manager context to ensure 'this' refers to the renderer
      const handleMouseEnter = e => {
        e.stopPropagation(); // Prevent event bubbling

        const type = element.dataset.tooltipType;

        let content;
        switch (type) {
          case 'contrast':
            content = {
              type: 'contrast',
              data: { hex, bestFamilyMatch },
            };
            break;
          case 'badge':
            content = {
              type: 'badge',
              data: {
                title: element.dataset.tooltipTitle,
                description: element.dataset.tooltipDescription,
              },
            };
            break;
        }

        if (content) {
          this.tooltipManager.show(content, e);
        }
      };

      const handleMouseMove = e => {
        e.stopPropagation();
        this.tooltipManager.position(e);
      };

      const handleMouseLeave = e => {
        e.stopPropagation();
        this.tooltipManager.hide();
      };

      // Bind event listeners with proper context
      const boundEnter = handleMouseEnter.bind(this);
      const boundMove = handleMouseMove.bind(this);
      const boundLeave = handleMouseLeave.bind(this);

      element.addEventListener('mouseenter', boundEnter);
      element.addEventListener('mousemove', boundMove);
      element.addEventListener('mouseleave', boundLeave);

      // Store cleanup functions
      card._cleanupListeners.push(() => {
        element.removeEventListener('mouseenter', boundEnter);
        element.removeEventListener('mousemove', boundMove);
        element.removeEventListener('mouseleave', boundLeave);
      });
    });

    // Copy button functionality - ONLY on button click
    if (copyBtn) {
      const handleCopyClick = e => {
        e.stopPropagation();
        DOMUtils.copyToClipboard(hex);
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = 'Copy';
        }, 2000);
      };

      copyBtn.addEventListener('click', handleCopyClick);

      card._cleanupListeners.push(() => {
        copyBtn.removeEventListener('click', handleCopyClick);
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

    if (!colors || typeof colors !== 'object') {
      console.warn(`Renderer: Invalid colors data for ${containerId}`);
      return;
    }

    // Clear existing content
    container.innerHTML = '';

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
      console.warn('Renderer: No semantic tokens to update');
      return;
    }

    let updateCount = 0;

    Object.keys(state.semanticTokens).forEach(tokenName => {
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
      'color-preview-light',
      'color-preview-dark',
      'color-preview-alpha'
    );

    if (token.hex.includes('rgba') || token.hex === 'transparent') {
      preview.classList.add('color-preview-alpha');
      preview.style.setProperty('--dynamic-bg', token.hex);
    } else {
      const isLight = ColorUtils.isLightColor(token.hex);
      preview.classList.add(
        isLight ? 'color-preview-light' : 'color-preview-dark'
      );

      // Set dynamic colors via CSS custom properties
      preview.style.setProperty('--dynamic-bg', token.hex);

      // Always set contrast text color for better reliability
      const contrastTextColor = this.getContrastTextColor(token.hex);
      preview.style.setProperty('--dynamic-text', contrastTextColor);
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
        id: 'success-demo',
        bg: 'success-background',
        fg: 'success-foreground',
      },
      {
        id: 'warning-demo',
        bg: 'warning-background',
        fg: 'warning-foreground',
      },
      {
        id: 'error-demo',
        bg: 'error-background',
        fg: 'error-foreground',
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

    console.log('🎨 Demo components updated');
  }

  updateDemoTextElements() {
    const elements = [
      { selector: '.demo-heading', className: 'demo-text-primary' },
      { selector: '.demo-subheading', className: 'demo-text-secondary' },
      { selector: '.demo-body', className: 'demo-text-tertiary' },
      { selector: '.demo-caption', className: 'demo-text-quaternary' },
    ];

    elements.forEach(({ selector, className }) => {
      const element = document.querySelector(selector);
      if (element) {
        // Remove any existing demo text classes
        element.classList.remove(
          'demo-text-primary',
          'demo-text-secondary',
          'demo-text-tertiary',
          'demo-text-quaternary'
        );
        // Add the appropriate class
        element.classList.add(className);
      }
    });
  }

  updateSemanticBadges(theme) {
    const semanticBadges = document.querySelectorAll('.semantic-badge');
    if (
      semanticBadges.length > 0 &&
      state.semanticTokens['success-background'] &&
      state.semanticTokens['success-foreground']
    ) {
      const successBg = state.semanticTokens['success-background'][theme].hex;
      const successFg = state.semanticTokens['success-foreground'][theme].hex;

      semanticBadges.forEach(badge => {
        badge.style.backgroundColor = successBg;
        badge.style.color = successFg;
      });
    }
  }

  updateTextFieldStyling() {
    const textFields = document.querySelectorAll('.text-field');

    textFields.forEach(field => {
      // Remove any existing state classes
      field.classList.remove(
        'text-field-success-active',
        'text-field-error-active'
      );

      // Clear any inline styles
      field.style.borderColor = '';
      field.style.boxShadow = '';

      // Add appropriate CSS classes
      if (field.classList.contains('success')) {
        field.classList.add('text-field-success-active');
      } else if (field.classList.contains('error')) {
        field.classList.add('text-field-error-active');
      }
    });
  }

  // =============================================================================
  // MAIN RENDER METHOD
  // =============================================================================

  renderInterface() {
    if (this.isRendering) {
      console.warn('Renderer: Already rendering, skipping');
      return;
    }

    if (!state.isInitialized()) {
      console.error('Renderer: Cannot render - state not initialized');
      return;
    }

    this.isRendering = true;

    try {
      console.log('🎨 Starting interface render...');

      // Update page metadata
      this.updatePageMetadata();

      // Render primitive color grids
      this.renderPrimitiveGrid(
        state.neutralColors,
        'neutral-grid',
        state.getCurrentNeutralName()
      );

      this.renderPrimitiveGrid(
        state.primaryColors,
        'primary-grid',
        state.getCurrentPrimaryName()
      );

      // Update semantic tokens
      this.updateSemanticTokens();

      // Update demo components
      this.updateDemoComponents();

      console.log('✅ Interface render complete');
    } catch (error) {
      console.error('❌ Renderer error:', error);
    } finally {
      this.isRendering = false;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Force a complete re-render
  forceRender() {
    console.log('🔄 Forcing complete re-render...');
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
