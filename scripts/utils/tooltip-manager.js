import { calculateAPCA } from '../color-oklch.js';

// =============================================================================
// Tooltip Manager - Global tooltip system for hover interactions
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

    // Calculate APCA contrast
    const apcaLc = calculateAPCA(hex, bestFamilyMatch.hex);
    const apcaPass = apcaLc !== null && apcaLc >= 60;

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
        <div class="tooltip-standard ${apcaPass ? 'pass' : 'fail'}">
          <span class="standard-icon">${apcaPass ? '✓' : '✕'}</span>
          APCA Lc ${apcaLc !== null ? apcaLc : 'N/A'}
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

export const tooltipManager = new TooltipManager();