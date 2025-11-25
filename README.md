# Zont UX Builder

A powerful wireframe and UX design builder tool for creating responsive layouts across multiple viewports. Export your designs as AI-friendly JSON to generate production-ready Next.js code instantly!

## ✨ AI Code Generation (NEW!)

**Build wireframes → Export JSON → Get production code!**

Zont UX Builder exports AI-friendly JSON that can be used with Claude, ChatGPT, or any AI to generate production-ready Next.js applications with a simple prompt:

```
Create a Next.js page from this wireframe JSON.
```

**Learn more:**
- 🚀 [Quick Start Guide](QUICK_START_AI_GENERATION.md) - Get started in 3 steps
- 📖 [Full AI Generation Guide](AI_GENERATION_GUIDE.md) - Comprehensive documentation
- 📦 [Example Export](example-export.json) - Sample JSON export
- 🧪 [POC Details](AI_GENERATION_POC.md) - Technical implementation

## Features

- **Drag & Drop Interface**: Easily add and position components on the canvas
- **Rich Component Library**:
  - Headers: Simple, E-commerce, SaaS, Mobile variants
  - Heroes: Center/Left/Right aligned, with/without background
  - Content Patterns: Product lists, cards, details, contact forms
  - Basic Elements: Logo, Buttons, Titles, Cards, Forms, etc.
  - Footers: Simple, Multi-column variants
- **Multi-Viewport Support**: Design independently for mobile, tablet, and desktop
- **Component Properties**: Customize alignment, variants, size, item counts, and more
- **AI-Friendly Export**: Export as JSON with built-in AI generation hints
- **PNG/PDF Export**: Visual exports for presentations and reference
- **Save & Load**: Auto-save to localStorage and export/import as JSON
- **Grid-Based Layout**: Precise 12-column responsive grid system
- **Wireframe Style**: Clean, professional wireframe aesthetics with image placeholders

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **React Grid Layout** for drag-and-drop functionality
- **TailwindCSS** for styling

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Building Wireframes

1. **Add Components**: Drag components from the left sidebar to the canvas
2. **Position & Resize**: Drag to move, resize from corners
3. **Select Multiple**: Click canvas and drag to select multiple components, or Ctrl/Cmd+Click
4. **Edit Properties**: Select a component to edit its properties in the right panel
5. **Switch Viewports**: Use the viewport switcher to design for different screen sizes
6. **Adjust Canvas**: Click on canvas dimensions to customize section heights
7. **Save Project**: Auto-saves to localStorage, or export as JSON file
8. **Import Project**: Load previously exported JSON files

### Generating Code with AI

1. **Build your wireframe** in UX Builder
2. **Click "Export JSON"** to download the wireframe data
3. **Upload JSON to AI** (Claude, ChatGPT, etc.) with prompt:
   ```
   Create a Next.js 14 page from this wireframe JSON.
   Use TypeScript, Tailwind CSS, and App Router.
   ```
4. **Get production-ready code** with responsive design, accessibility, and SEO!

See [QUICK_START_AI_GENERATION.md](QUICK_START_AI_GENERATION.md) for detailed instructions.

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Vite and deploy

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## License

MIT

## Credits

Built with Claude Code
