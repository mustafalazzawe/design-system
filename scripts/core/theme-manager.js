import { state } from "./state.js";
import { cssUpdater } from "./css-updater.js";
import { renderer } from './renderer.js';

// =============================================================================
// Theme Management System
// =============================================================================

class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.mediaQuery = null;
    this.init();
  }

  init() {
    const preferredTheme = this.getStoredTheme();
    this.setTheme(preferredTheme);
    this.setupMediaQueryListener();
  }

  getStoredTheme() {
    try {
      const stored = localStorage.getItem("theme-preference");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch (error) {
      console.warn("Could not read theme preference:", error);
    }

    // Fall back to system preference
    return this.getSystemPreference();
  }

  getSystemPreference() {
    if (window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light"; // Default fallback
  }

  setTheme(theme) {
    // Validate theme
    if (theme !== "light" && theme !== "dark") {
      console.warn(`Invalid theme: ${theme}, defaulting to light`);
      theme = "light";
    }

    // Store previous theme for comparison
    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    // Update DOM
    document.documentElement.setAttribute("data-theme", theme);

    // Store preference
    this.storeThemePreference(theme);

    // Update UI elements
    this.updateUI(theme);

    // Update system if color system is ready
    if (state.isInitialized() && state.semanticTokens) {
      cssUpdater.updateVariables();

      // Update other systems that depend on theme
      if (renderer) {
        renderer.updateSemanticTokens();
        renderer.updateDemoComponents();
      }
    }

    // Dispatch custom event for other components
    this.dispatchThemeChangeEvent(theme, previousTheme);

    console.log(`🌙 Theme changed: ${previousTheme || "initial"} → ${theme}`);
  }

  storeThemePreference(theme) {
    try {
      localStorage.setItem("theme-preference", theme);
    } catch (error) {
      console.warn("Could not save theme preference:", error);
    }
  }

  updateUI(theme) {
    const icon = document.getElementById("theme-icon");
    const text = document.getElementById("theme-text");

    icon.classList.add('icon.md');

    if (icon && text) {
      if (theme === "dark") {
        
        icon.setAttribute("data-lucide", "sun");
        text.textContent = "Light";
        icon.setAttribute("aria-label", "Switch to light mode");
      } else {
        icon.setAttribute("data-lucide", "moon");
        text.textContent = "Dark";
        icon.setAttribute("aria-label", "Switch to dark mode");
      }

      // Reinitialize Lucide icons for the updated icon
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    // Update any other theme-dependent UI elements
    this.updateThemeMetaTag(theme);
  }

  updateThemeMetaTag(theme) {
    // Update theme-color meta tag for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }

    // Use appropriate background color for the theme
    const themeColor =
      theme === "dark"
        ? state.semanticTokens?.["bg-primary"]?.dark?.hex || "#18181b"
        : state.semanticTokens?.["bg-primary"]?.light?.hex || "#fafafa";

    metaThemeColor.content = themeColor;
  }

  toggle() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
    return newTheme;
  }

  setupMediaQueryListener() {
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const hasStoredPreference = localStorage.getItem("theme-preference");
        if (!hasStoredPreference) {
          const systemTheme = e.matches ? "dark" : "light";
          console.log(`🔄 System theme changed: ${systemTheme}`);
          this.setTheme(systemTheme);
        }
      };

      // Modern browsers
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener("change", handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        this.mediaQuery.addListener(handleSystemThemeChange);
      }
    }
  }

  dispatchThemeChangeEvent(newTheme, previousTheme) {
    const event = new CustomEvent("themechange", {
      detail: {
        theme: newTheme,
        previousTheme: previousTheme,
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(event);
  }

  // Public API methods
  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === "dark";
  }

  isLightMode() {
    return this.currentTheme === "light";
  }

  // Reset to system preference
  resetToSystemPreference() {
    localStorage.removeItem("theme-preference");
    const systemTheme = this.getSystemPreference();
    this.setTheme(systemTheme);
    console.log(`🔄 Reset to system preference: ${systemTheme}`);
  }

  // Get theme info for debugging
  getThemeInfo() {
    return {
      current: this.currentTheme,
      stored: localStorage.getItem("theme-preference"),
      system: this.getSystemPreference(),
      hasMediaQuery: !!this.mediaQuery,
      supportsColorScheme:
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").media !== "not all",
    };
  }

  // Cleanup method (for testing or SPA navigation)
  cleanup() {
    if (this.mediaQuery) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener(
          "change",
          this.handleSystemThemeChange
        );
      } else {
        this.mediaQuery.removeListener(this.handleSystemThemeChange);
      }
    }
  }
}

export const themeManager = new ThemeManager();
