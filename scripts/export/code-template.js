// =============================================================================
// Code Template Generation Helper
// =============================================================================

class CodeTemplate {
  constructor() {
    this.blocks = [];
  }

  addBlock(opener, content, closer = "}", indentLevel = 0) {
    this.blocks.push({ opener, content, closer, indentLevel });
    return this;
  }

  addLines(lines, indentLevel = 0) {
    this.blocks.push({
      opener: null,
      content: lines,
      closer: null,
      indentLevel,
    });
    return this;
  }

  render(indentSize = 2) {
    return this.blocks
      .map((block) => {
        let result = [];
        const baseIndent = " ".repeat(block.indentLevel * indentSize);
        const contentIndent = " ".repeat((block.indentLevel + 1) * indentSize);

        if (block.opener) {
          result.push(baseIndent + block.opener);
        }

        if (Array.isArray(block.content) && block.content.length > 0) {
          result.push(
            ...block.content.map((line) => {
              if (line.trim() === "") return ""; // Preserve empty lines

              // Preserve intentional indentation if line starts with spaces
              if (line.startsWith(" ")) {
                return contentIndent + line;
              } else {
                return contentIndent + line.trim();
              }
            })
          );
        }

        if (block.closer) {
          result.push(baseIndent + block.closer);
        }

        return result.join("\n");
      })
      .join("\n\n");
  }

  // Utility method for quick single-block templates
  static createBlock(opener, content, closer = "}", indentLevel = 0) {
    const template = new CodeTemplate();
    return template.addBlock(opener, content, closer, indentLevel);
  }

  // Utility method for simple line collections
  static createLines(lines, indentLevel = 0) {
    const template = new CodeTemplate();
    return template.addLines(lines, indentLevel);
  }
}

export { CodeTemplate };