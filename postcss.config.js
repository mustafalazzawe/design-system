// Custom plugin to add spacing between property groups
const addPropertyGroupSpacing = () => {
  return {
    postcssPlugin: 'add-property-group-spacing',
    Declaration(decl, { result }) {
      const propertyGroups = {
        priority: ['content'],
        positioning: [
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
          'flex',
          'flex-direction',
          'flex-wrap',
          'flex-flow',
          'flex-grow',
          'flex-shrink',
          'flex-basis',
          'justify-content',
          'justify-items',
          'justify-self',
          'align-content',
          'align-items',
          'align-self',
          'place-content',
          'place-items',
          'place-self',
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
          'grid-area',
          'grid-column',
          'grid-row',
          'order',
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

      // Check if previous declaration is from a different group
      const prevDecl = decl.prev();
      if (!prevDecl || prevDecl.type !== 'decl') return;

      const prevGroup = Object.keys(propertyGroups).find(group =>
        propertyGroups[group].includes(prevDecl.prop)
      );

      // If different groups, add spacing while preserving existing indentation
      if (prevGroup && prevGroup !== currentGroup) {
        // Get the existing indentation from the previous declaration
        const existingIndent = prevDecl.raws.before?.match(/\n(\s*)$/)?.[1] || '  ';
        decl.raws.before = `\n\n${existingIndent}`;
      }
    },
  };
};

addPropertyGroupSpacing.postcss = true;

module.exports = {
  plugins: [
    require('css-declaration-sorter')({
      order: function (a, b) {
        const customOrder = [
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
          'display',
          'flex',
          'flex-direction',
          'flex-wrap',
          'flex-flow',
          'flex-grow',
          'flex-shrink',
          'flex-basis',
          'justify-content',
          'justify-items',
          'justify-self',
          'align-content',
          'align-items',
          'align-self',
          'place-content',
          'place-items',
          'place-self',
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
          'grid-area',
          'grid-column',
          'grid-row',
          'order',
          'float',
          'clear',
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