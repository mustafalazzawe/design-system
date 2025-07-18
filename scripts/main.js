// Core modules
import { state } from "./core/state.js";
import { cssUpdater } from "./core/css-updater.js";
import { themeManager } from "./core/theme-manager.js";
import { renderer } from "./core/renderer.js";

// UI modules
import { configPanel } from "./panels/config-panel.js";

// Export modules
import {
  exportManager,
  openEnhancedExportModal,
} from "./export/export-manager.js";

// Component helpers
import { ComponentHelpers } from "./utils/component-helpers.js";

// =============================================================================
// Main Application - Initialization & Coordination
// =============================================================================

class ColorSystemApp {
  constructor() {
    this.initialized = false;
    this.components = {};
  }

  async init() {
    if (this.initialized) {
      console.warn("App: Already initialized");
      return;
    }

    console.log("🚀 Initializing Modular Color Design System...");

    try {
      // Load the default preset to ensure correct color names
      const success = state.loadPreset("default");
      if (!success) {
        throw new Error("Failed to initialize color system");
      }

      // Initialize core systems
      this.initializeCoreSystems();

      // Initialize UI components
      this.initializeComponents();

      // Setup event listeners
      this.setupEventListeners();

      // Setup global API
      this.setupGlobalAPI();

      // Initial render
      this.performInitialRender();

      this.initialized = true;
      this.logInitializationSuccess();
    } catch (error) {
      console.error("❌ App initialization failed:", error);
      this.handleInitializationError(error);
    }
  }

  initializeCoreSystems() {
    // Update CSS variables and render interface
    cssUpdater.updateVariables();

    console.log("✅ Core systems initialized");
  }

  initializeComponents() {
    // Store component references
    this.components = {
      configPanel: configPanel,
      exportManager: exportManager,
      themeManager: themeManager,
      renderer: renderer,
      cssUpdater: cssUpdater,
      state: state,
    };

    console.log("✅ UI components initialized");
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle?.addEventListener("click", () => themeManager.toggle());
    themeToggle?.addEventListener("keydown", this.handleKeyboardNavigation);

    // Config toggle
    const configToggle = document.getElementById("config-toggle");
    configToggle?.addEventListener("click", () => configPanel.toggle());
    configToggle?.addEventListener("keydown", this.handleKeyboardNavigation);

    // Demo component events
    ComponentHelpers.bindDemoEvents();

    // Global keyboard navigation
    document.addEventListener("keydown", this.handleKeyboardNavigation);

    console.log("✅ Event listeners setup");
  }

  handleKeyboardNavigation(event) {
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

      // Close export modal if open
      if (exportManager.modal?.classList.contains("show")) {
        exportManager.close();
      }
    }
  }

  setupGlobalAPI() {
    // Global API for external access
    window.colorSystem = {
      // Core system access
      current: () => state.currentColorSystem,

      // Preset management
      loadPreset: (name) => {
        const success = state.loadPreset(name);
        if (success) {
          this.updateAllSystems();
        }
        return success;
      },

      // Custom color management
      setCustomColors: (neutral, primary) => {
        const success = state.setCustomColors(neutral, primary);
        if (success) {
          this.updateAllSystems();
        }
        return success;
      },

      // UI controls
      toggleConfig: () => configPanel.toggle(),
      toggleTheme: () => themeManager.toggle(),
      openExport: () => openEnhancedExportModal(),

      // System operations
      reload: () => this.performInitialRender(),
      updateStyling: () => this.updateAllSystems(),

      // Theme management
      setTheme: (theme) => themeManager.setTheme(theme),
      getTheme: () => themeManager.getCurrentTheme(),

      // State access
      getState: () => state.getDebugInfo(),

      // Component access
      components: this.components,
    };

    console.log("✅ Global API setup");
  }

  performInitialRender() {
    try {
      renderer.renderInterface();
      console.log("✅ Initial render complete");
    } catch (error) {
      console.error("❌ Initial render failed:", error);
    }
  }

  updateAllSystems() {
    try {
      cssUpdater.updateVariables();
      renderer.renderInterface();
      if (configPanel.isReady()) {
        configPanel.updateInputs();
      }
      console.log("🔄 All systems updated");
    } catch (error) {
      console.error("❌ System update failed:", error);
    }
  }

  logInitializationSuccess() {
    console.log("✅ Modular Color Design System initialized successfully");
    console.log("🎨 Current colors:", {
      neutral: state.getCurrentNeutralName(),
      primary: state.getCurrentPrimaryName(),
    });
    console.log("🌙 Current theme:", themeManager.getCurrentTheme());
    console.log("⚙️ Click the Config button in the navbar to customize colors");
    console.log("🔧 Available via window.colorSystem object");
  }

  handleInitializationError(error) {
    // Show user-friendly error message
    const errorMessage = document.createElement("div");
    errorMessage.style.cssText = `
     position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
     background: #dc2626; color: white; padding: 16px 24px;
     border-radius: 8px; font-family: system-ui, sans-serif;
     font-weight: 500; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
   `;
    errorMessage.textContent =
      "Failed to initialize color system. Please refresh the page.";
    document.body.appendChild(errorMessage);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(errorMessage)) {
        document.body.removeChild(errorMessage);
      }
    }, 5000);
  }

  // Public methods for manual control
  restart() {
    console.log("🔄 Restarting color system...");
    this.initialized = false;
    this.init();
  }

  getStatus() {
    return {
      initialized: this.initialized,
      stateReady: state.isInitialized(),
      rendererReady: renderer.isReady(),
      configPanelReady: configPanel?.isReady(),
      exportManagerReady: !!exportManager.modal,
    };
  }

  // Cleanup method for testing or SPA navigation
  cleanup() {
    console.log("🧹 Cleaning up color system...");

    // Cleanup components
    if (configPanel?.cleanup) configPanel.cleanup();
    if (exportManager?.cleanup) exportManager.cleanup();
    if (themeManager?.cleanup) themeManager.cleanup();

    // Remove global API
    delete window.colorSystem;

    // Reset initialization flag
    this.initialized = false;

    console.log("✅ Cleanup complete");
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Create global app instance
const app = new ColorSystemApp();

// Initialize when DOM is ready
function initializeApp() {
  app.init();
}

// Auto-initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Make app available globally for debugging
window.colorSystemApp = app;

console.log("📱 Main application module loaded");
