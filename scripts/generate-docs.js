#!/usr/bin/env node

/**
 * Simple script to generate basic documentation for @woby/wui components
 * This script creates markdown files with basic structure for each component
 */

const fs = require('fs');
const path = require('path');

// Components that need documentation
const components = [
  'Appbar',
  'Avatar',
  'Badge',
  'Button',
  'Card',
  'Checkbox',
  'Chip',
  'Collapse',
  'Fab',
  'IconButton',
  'NumberField',
  'Paper',
  'SideBar',
  'Switch',
  'Tabs',
  'TextArea',
  'TextField',
  'ToggleButton',
  'Toolbar',
  'Zoomable'
];

// Directory paths
const srcDir = path.join(__dirname, '..', 'src');
const docsComponentsDir = path.join(__dirname, '..', 'docs', 'components');
const docsApiDir = path.join(__dirname, '..', 'docs', 'api');

// Ensure directories exist
if (!fs.existsSync(docsComponentsDir)) {
  fs.mkdirSync(docsComponentsDir, { recursive: true });
}

if (!fs.existsSync(docsApiDir)) {
  fs.mkdirSync(docsApiDir, { recursive: true });
}

// Generate component documentation
components.forEach(component => {
  const componentFile = path.join(srcDir, `${component}.tsx`);

  // Check if component file exists
  if (fs.existsSync(componentFile)) {
    // Generate basic component documentation
    const componentDoc = `# ${component}

## Import

\`\`\`tsx
import { ${component} } from '@woby/wui'
\`\`\`

## Basic Usage

\`\`\`tsx
import { ${component} } from '@woby/wui'

const MyComponent = () => {
  return (
    <${component}>
      {/* Component content */}
    </${component}>
  )
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | \`JSX.Child\` | - | The content of the component |
| class | \`string \| string[] \| { [key: string]: boolean }\` | - | Additional CSS classes to apply |

## Examples

### Basic Example

\`\`\`tsx
<${component}>
  Example content
</${component}>
\`\`\`

## TypeScript Definitions

\`\`\`tsx
type ${component}Props = JSX.HTMLAttributes<HTMLDivElement>

export const ${component}: (props: ${component}Props) => JSX.Element
\`\`\`
`;

    // Write component documentation
    const componentDocPath = path.join(docsComponentsDir, `${component}.md`);
    fs.writeFileSync(componentDocPath, componentDoc);

    console.log(`Generated documentation for ${component}`);
  }
});

console.log('Documentation generation complete!');