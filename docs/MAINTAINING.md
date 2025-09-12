# Maintaining Documentation

This guide provides instructions for maintaining and updating the woby-wui documentation.

## Documentation Structure

The documentation is organized into the following directories:

- `docs/` - Main documentation directory
  - `components/` - Individual component documentation
  - `guides/` - Tutorials and guides
  - `api/` - Detailed API references
  - `index.html` - Documentation homepage

## Adding New Components

When adding new components to woby-wui, follow these steps to create documentation:

1. Create a component documentation file in `docs/components/`:
   ```bash
   # Run the documentation generation script
   npm run docs:generate
   ```

2. Manually update the generated documentation with:
   - Detailed prop descriptions
   - Usage examples
   - TypeScript definitions
   - CSS class information

3. Add API documentation in `docs/api/` with detailed prop information and TypeScript definitions

4. Update `docs/components/README.md` to include the new component

## Updating Documentation

### Component Documentation

When updating components, ensure the documentation is kept in sync:

1. Update prop descriptions when adding/removing props
2. Add new usage examples for new features
3. Update TypeScript definitions
4. Modify CSS class documentation if styling changes

### Guides

Update guides when:
- Adding new features that developers need to know about
- Changing APIs that affect usage patterns
- Adding new best practices

## Documentation Format

### Component Documentation

Component documentation should include:

1. **Import statement** - How to import the component
2. **Basic usage** - Simple example of how to use the component
3. **Props table** - Detailed prop descriptions with types and defaults
4. **Examples** - Multiple usage examples
5. **TypeScript definitions** - Type definitions for the component
6. **CSS classes** - Information about styling and customization

### Guide Documentation

Guide documentation should include:

1. **Clear objective** - What the guide will teach
2. **Prerequisites** - What the reader should know before reading
3. **Step-by-step instructions** - Clear, actionable steps
4. **Examples** - Code examples with explanations
5. **Best practices** - Recommendations for optimal usage
6. **Troubleshooting** - Common issues and solutions

## Style Guide

### Writing Style

- Use clear, concise language
- Write in the second person ("you" rather than "the developer")
- Use active voice
- Include practical examples
- Explain the "why" behind recommendations

### Code Examples

- Use TypeScript syntax highlighting
- Provide complete, runnable examples
- Include comments for complex code
- Show both basic and advanced usage
- Use realistic data in examples

### Formatting

- Use Markdown for all documentation
- Use H1 for main titles
- Use H2 for section headers
- Use H3 for subsections
- Use tables for prop documentation
- Use code blocks for examples
- Use links to related documentation

## Testing Documentation

To test documentation:

1. Review all links to ensure they work
2. Verify code examples are syntactically correct
3. Check that TypeScript definitions match the actual implementation
4. Ensure all component names and APIs are accurate

## Publishing Documentation

Documentation is published as part of the GitHub repository and can be viewed directly on GitHub or through GitHub Pages.

To publish documentation updates:

1. Commit changes to the repository
2. Push to the main branch
3. Documentation will be available immediately on GitHub

## Automated Documentation Generation

The project includes a script to automatically generate basic documentation for components:

```bash
npm run docs:generate
```

This script:
- Creates basic documentation files for all components
- Includes import statements and basic usage examples
- Provides a template for props and TypeScript definitions

Note that generated documentation requires manual updates to be complete and accurate.

## Keeping Documentation Up-to-Date

To ensure documentation stays current:

1. Update documentation when making code changes
2. Review documentation during code reviews
3. Periodically audit documentation for accuracy
4. Update examples when APIs change
5. Add deprecation notices for deprecated features