import { CodeTemplate } from './code-template.js';
import { state } from '../core/state.js';
import { ColorUtils } from '../utils/color-utils.js';

// =============================================================================
// Code Generators for Different Export Formats
// =============================================================================

class CodeGenerators {
  constructor() {
    this.formatters = {
      hex: (hex) => hex,
      rgb: (hex) => ColorUtils.formatColor(hex, "rgb"),
      hsl: (hex) => ColorUtils.formatColor(hex, "hsl"),
    };
  }

  // =============================================================================
  // CSS GENERATOR
  // =============================================================================

  generateCSS(options = {}) {
    const {
      format = "hex",
      includeMedia = false,
      includeThemes = true,
    } = options;

    if (!state.currentColorSystem) {
      console.warn(
        "Code Generators: No color system available for CSS generation"
      );
      return "";
    }

    const { neutralColors, primaryColors, semanticTokens } = state;
    const neutralName = state.currentColorSystem.meta.neutralName;
    const primaryName = state.currentColorSystem.meta.primaryName;

    const template = new CodeTemplate();

    // Build the root block content
    const rootContent = [];

    // Add neutral colors
    Object.entries(neutralColors).forEach(([weight, colorData]) => {
      rootContent.push(
        `--${neutralName}-${weight}: ${this.formatColor(
          colorData.hex,
          format
        )};`
      );
    });

    rootContent.push("");

    // Add primary colors
    Object.entries(primaryColors).forEach(([weight, colorData]) => {
      rootContent.push(
        `--${primaryName}-${weight}: ${this.formatColor(
          colorData.hex,
          format
        )};`
      );
    });

    if (includeThemes) {
      rootContent.push("");
      rootContent.push("/* Semantic tokens */");
      Object.entries(semanticTokens).forEach(([tokenName, token]) => {
        rootContent.push(
          `--${tokenName}: ${this.formatColor(token.light.hex, format)};`
        );
      });
    }

    // Determine the opener and closer based on @media setting
    const opener = includeMedia
      ? "@media (prefers-color-scheme: light) {\n  :root {"
      : ":root {";

    const closer = includeMedia ? "  }\n}" : "}";

    template.addBlock(opener, rootContent, closer);

    // Add dark theme if themes are included
    if (includeThemes) {
      const darkOpener = includeMedia
        ? "@media (prefers-color-scheme: dark) {\n  :root {"
        : '[data-theme="dark"] {';

      const darkContent = ["/* Dark theme overrides */"];
      Object.entries(semanticTokens).forEach(([tokenName, token]) => {
        darkContent.push(
          `--${tokenName}: ${this.formatColor(token.dark.hex, format)};`
        );
      });

      const darkCloser = includeMedia ? "  }\n}" : "}";
      template.addBlock(darkOpener, darkContent, darkCloser);
    }

    return template.render();
  }

  // =============================================================================
  // TAILWIND CONFIG GENERATOR
  // =============================================================================

  generateTailwindConfig(options = {}) {
    const { format = "hex" } = options;

    if (!state.currentColorSystem) {
      console.warn(
        "Code Generators: No color system available for Tailwind config generation"
      );
      return "";
    }

    const { neutralColors, primaryColors } = state;
    const neutralName = state.currentColorSystem.meta.neutralName;
    const primaryName = state.currentColorSystem.meta.primaryName;

    const template = new CodeTemplate();
    const allContent = [];

    // Add neutral colors
    allContent.push(`${neutralName}: {`);
    Object.entries(neutralColors).forEach(([weight, colorData]) => {
      allContent.push(
        `  ${weight}: '${this.formatColor(colorData.hex, format)}',`
      );
    });
    allContent.push("},");

    // Add primary colors
    allContent.push(`${primaryName}: {`);
    Object.entries(primaryColors).forEach(([weight, colorData]) => {
      allContent.push(
        `  ${weight}: '${this.formatColor(colorData.hex, format)}',`
      );
    });
    allContent.push("}");

    template.addBlock("colors: {", allContent, "}");

    return template.render();
  }

  // =============================================================================
  // TAILWIND CSS GENERATOR
  // =============================================================================

  generateTailwindCSS(options = {}) {
    const { format = "hex", includeThemes = true } = options;

    if (!state.semanticTokens) {
      console.warn(
        "Code Generators: No semantic tokens available for Tailwind CSS generation"
      );
      return "/* No semantic tokens to display */";
    }

    const { semanticTokens } = state;
    const template = new CodeTemplate();

    if (includeThemes) {
      // Build the complete @layer structure with light/dark themes
      const layerContent = [];

      // Add :root section (light theme)
      layerContent.push(":root {");
      Object.entries(semanticTokens).forEach(([tokenName, token]) => {
        layerContent.push(
          `  --${tokenName}: ${this.formatColor(token.light.hex, format)};`
        );
      });
      layerContent.push("}");

      layerContent.push("");

      // Add dark theme section
      layerContent.push('[data-theme="dark"] {');
      Object.entries(semanticTokens).forEach(([tokenName, token]) => {
        layerContent.push(
          `  --${tokenName}: ${this.formatColor(token.dark.hex, format)};`
        );
      });
      layerContent.push("}");

      // Wrap everything in @layer base
      template.addBlock("@layer base {", layerContent, "}");
    } else {
      // Just show semantic tokens in :root without theme organization
      const layerContent = [];

      layerContent.push(":root {");
      Object.entries(semanticTokens).forEach(([tokenName, token]) => {
        layerContent.push(
          `  --${tokenName}: ${this.formatColor(token.light.hex, format)};`
        );
      });
      layerContent.push("}");

      template.addBlock("@layer base {", layerContent, "}");
    }

    return template.render();
  }

  // =============================================================================
  // JSON GENERATOR
  // =============================================================================

  generateJSON(options = {}) {
    const { format = "hex", includeThemes = true } = options;

    if (!state.currentColorSystem) {
      console.warn(
        "Code Generators: No color system available for JSON generation"
      );
      return "{}";
    }

    const { neutralColors, primaryColors, semanticTokens } = state;
    const neutralName = state.currentColorSystem.meta.neutralName;
    const primaryName = state.currentColorSystem.meta.primaryName;

    const data = { colors: {} };

    // Add neutral colors
    data.colors[neutralName] = {};
    Object.entries(neutralColors).forEach(([weight, colorData]) => {
      data.colors[neutralName][weight] = this.formatColor(
        colorData.hex,
        format
      );
    });

    // Add primary colors
    data.colors[primaryName] = {};
    Object.entries(primaryColors).forEach(([weight, colorData]) => {
      data.colors[primaryName][weight] = this.formatColor(
        colorData.hex,
        format
      );
    });

    // Add semantic tokens if requested
    if (includeThemes && semanticTokens) {
      data.semanticTokens = { light: {}, dark: {} };

      Object.entries(semanticTokens).forEach(([tokenName, token]) => {
        data.semanticTokens.light[tokenName] = this.formatColor(
          token.light.hex,
          format
        );
        data.semanticTokens.dark[tokenName] = this.formatColor(
          token.dark.hex,
          format
        );
      });
    }

    return JSON.stringify(data, null, 2);
  }

  // =============================================================================
  // TYPESCRIPT DECLARATIONS GENERATOR 
  // =============================================================================

  generateTypeScript(options = {}) {
    if (!state.currentColorSystem) {
      console.warn(
        "Code Generators: No color system available for TypeScript generation"
      );
      return "";
    }

    const { neutralColors, primaryColors, semanticTokens } = state;
    const neutralName = state.currentColorSystem.meta.neutralName;
    const primaryName = state.currentColorSystem.meta.primaryName;

    const template = new CodeTemplate();

    // Generate color weight type
    const weights = Object.keys(neutralColors);
    const weightType = weights.map((w) => `"${w}"`).join(" | ");

    const typeContent = [
      "// Color system type definitions",
      "",
      `export type ColorWeight = ${weightType};`,
      "",
      `export type ${
        neutralName.charAt(0).toUpperCase() + neutralName.slice(1)
      }Color = \`${neutralName}-\${ColorWeight}\`;`,
      `export type ${
        primaryName.charAt(0).toUpperCase() + primaryName.slice(1)
      }Color = \`${primaryName}-\${ColorWeight}\`;`,
      "",
      "export type SemanticToken =",
    ];

    // Add semantic token names
    const tokenNames = Object.keys(semanticTokens).map(
      (name) => `  | "${name}"`
    );
    typeContent.push(
      ...tokenNames.slice(0, 1).map((name) => name.replace("|", " "))
    );
    typeContent.push(...tokenNames.slice(1));
    typeContent.push(";");

    template.addLines(typeContent);

    return template.render();
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  formatColor(hex, format = "hex") {
    const formatter = this.formatters[format];
    return formatter ? formatter(hex) : hex;
  }

  // Get available formats
  getAvailableFormats() {
    return Object.keys(this.formatters);
  }

  // Add custom formatter
  addFormatter(name, formatter) {
    this.formatters[name] = formatter;
  }

  // Generate all formats at once (useful for comparison)
  generateAll(options = {}) {
    const results = {};

    try {
      results.css = this.generateCSS(options);
      results.tailwindConfig = this.generateTailwindConfig(options);
      results.tailwindCSS = this.generateTailwindCSS(options);
      results.json = this.generateJSON(options);
      results.typescript = this.generateTypeScript(options);
    } catch (error) {
      console.error("Error generating all formats:", error);
    }

    return results;
  }

  // Validate current state before generation
  validateState() {
    const issues = [];

    if (!state.isInitialized()) {
      issues.push("Color system not initialized");
    }

    if (!state.neutralColors || Object.keys(state.neutralColors).length === 0) {
      issues.push("No neutral colors available");
    }

    if (!state.primaryColors || Object.keys(state.primaryColors).length === 0) {
      issues.push("No primary colors available");
    }

    if (
      !state.semanticTokens ||
      Object.keys(state.semanticTokens).length === 0
    ) {
      issues.push("No semantic tokens available");
    }

    return issues;
  }
}

export const codeGenerators = new CodeGenerators();
