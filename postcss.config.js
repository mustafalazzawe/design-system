// Custom plugin to add spacing between property groups
const addPropertyGroupSpacing = () => {
  return {
    postcssPlugin: 'add-property-group-spacing',
    Declaration(decl, { result }) {
      // Skip CSS custom properties (variables)
      if (decl.prop.startsWith('--')) return;

      const propertyGroups = {
        childContext: [
          'flex',
          'flex-grow', 
          'flex-shrink',
          'flex-basis',
          'grid-area',
          'grid-column',
          'grid-row',
          'grid-column-start',
          'grid-column-end',
          'grid-row-start',
          'grid-row-end',
          'order',
          'align-self',
          'justify-self',
          'place-self'
        ],
        positioning: [
          'content',
          'position',
          'top',
          'right',
          'bottom',
          'left',
          'z-index',
          'inset',
          'inset-block',
          'inset-inline',
        ],
        layout: [
          'display',
          'flex-direction',
          'flex-wrap',
          'flex-flow',
          'justify-content',
          'justify-items',
          'align-content',
          'align-items',
          'place-content',
          'place-items',
          'gap',
          'row-gap',
          'column-gap',
          'grid',
          'grid-template',
          'grid-template-columns',
          'grid-template-rows',
          'grid-template-areas',
          'grid-auto-columns',
          'grid-auto-rows',
          'grid-auto-flow',
          'float',
          'clear',
        ],
        boxModel: [
          'box-sizing',
          'width',
          'min-width',
          'max-width',
          'height',
          'min-height',
          'max-height',
          'aspect-ratio',
          'overflow',
          'overflow-x',
          'overflow-y',
          'margin',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left',
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'border-radius',
          'outline',
        ],
        typography: [
          'font',
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'line-height',
          'letter-spacing',
          'text-align',
          'text-decoration',
          'text-transform',
          'white-space',
          'word-break',
          'color',
        ],
        visual: [
          'background',
          'background-color',
          'background-image',
          'background-size',
          'background-position',
          'background-repeat',
          'box-shadow',
          'opacity',
          'visibility',
          'filter',
          'backdrop-filter',
        ],
        animation: [
          'cursor',
          'pointer-events',
          'user-select',
          'transition',
          'transform',
          'animation',
        ],
      };

      // Find which group this property belongs to
      const currentGroup = Object.keys(propertyGroups).find(group =>
        propertyGroups[group].includes(decl.prop)
      );

      if (!currentGroup) return;

      // Check if previous declaration exists
      const prevDecl = decl.prev();
      if (!prevDecl || prevDecl.type !== 'decl') return;

      // Skip if previous declaration is a CSS custom property
      if (prevDecl.prop.startsWith('--')) return;

      const prevGroup = Object.keys(propertyGroups).find(group =>
        propertyGroups[group].includes(prevDecl.prop)
      );

      // Get the rule's base indentation
      const parentRule = decl.parent;
      const firstDecl = parentRule.first;
      const baseIndent = firstDecl?.raws?.before?.match(/\n(\s*)$/)?.[1] || '  ';

      if (prevGroup && prevGroup === currentGroup) {
        // Same group - normalize to single line spacing (unless there's a comment)
        let hasCommentBetween = false;
        let current = prevDecl.next();
        
        while (current && current !== decl) {
          if (current.type === 'comment') {
            hasCommentBetween = true;
            break;
          }
          current = current.next();
        }

        // If no comment between, normalize to single line
        if (!hasCommentBetween) {
          decl.raws.before = `\n${baseIndent}`;
        }
      } else if (prevGroup && prevGroup !== currentGroup) {
        // Different groups - add spacing between groups
        decl.raws.before = `\n\n${baseIndent}`;
      }
    },
  };
};

// Register the plugin
addPropertyGroupSpacing.postcss = true;

// Export the configuration
module.exports = {
  plugins: [
    require('css-declaration-sorter')({
      order: function (a, b) {
        // Don't sort CSS custom properties (variables)
        if (a.startsWith('--') || b.startsWith('--')) {
          if (a.startsWith('--') && b.startsWith('--')) return 0;
          return 0;
        }

        const customOrder = [
          // Child/Parent Context - How this element behaves in its parent
          'flex',
          'flex-grow',
          'flex-shrink', 
          'flex-basis',
          'grid-area',
          'grid-column',
          'grid-row',
          'grid-column-start',
          'grid-column-end',
          'grid-row-start',
          'grid-row-end',
          'order',
          'align-self',
          'justify-self',
          'place-self',
          
          // Positioning - Where this element is positioned
          'content',
          'position',
          'top',
          'right',
          'bottom',
          'left',
          'z-index',
          'inset',
          'inset-block',
          'inset-inline',
          
          // Layout - How this element lays out its children
          'display',
          'flex-direction',
          'flex-wrap',
          'flex-flow',
          'justify-content',
          'justify-items',
          'align-content',
          'align-items',
          'place-content',
          'place-items',
          'gap',
          'row-gap',
          'column-gap',
          'grid',
          'grid-template',
          'grid-template-columns',
          'grid-template-rows',
          'grid-template-areas',
          'grid-auto-columns',
          'grid-auto-rows',
          'grid-auto-flow',
          'float',
          'clear',
          
          // Box Model - The element's own size and spacing
          'box-sizing',
          'width',
          'min-width',
          'max-width',
          'height',
          'min-height',
          'max-height',
          'aspect-ratio',
          'overflow',
          'overflow-x',
          'overflow-y',
          'margin',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left',
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'border-radius',
          'outline',
          
          // Typography
          'font',
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'line-height',
          'letter-spacing',
          'text-align',
          'text-decoration',
          'text-transform',
          'white-space',
          'word-break',
          'color',
          
          // Visual
          'background',
          'background-color',
          'background-image',
          'background-size',
          'background-position',
          'background-repeat',
          'box-shadow',
          'opacity',
          'visibility',
          'filter',
          'backdrop-filter',
          
          // Animation & Interaction
          'cursor',
          'pointer-events',
          'user-select',
          'transition',
          'transform',
          'animation',
        ];

        const isVendorPrefixed = prop => {
          return (
            prop.startsWith('-webkit-') ||
            prop.startsWith('-moz-') ||
            prop.startsWith('-ms-') ||
            prop.startsWith('-o-')
          );
        };

        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);
        const isVendorA = isVendorPrefixed(a);
        const isVendorB = isVendorPrefixed(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        if (!isVendorA && isVendorB) return -1;
        if (isVendorA && !isVendorB) return 1;
        return a.localeCompare(b);
      },
    }),
    addPropertyGroupSpacing(),
  ],
};