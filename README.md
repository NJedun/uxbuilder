# Zont UX Builder

A powerful wireframe and UX design builder tool for creating responsive layouts across multiple viewports.

## Features

- **Drag & Drop Interface**: Easily add and position components on the canvas
- **Atomic Components**:
  - Layout: Container, Card, Form
  - Content: Title, Paragraph, Link, List, Image, Logo
  - Interactive: Button, Input, Textarea, Dropdown
  - Social: Social Links
- **Multi-Viewport Support**: Design independently for mobile, tablet, and desktop
- **Component Properties**: Customize alignment, variants, size, and more
- **Save & Export**: Auto-save to localStorage and export/import as JSON
- **Grid-Based Layout**: Precise control with react-grid-layout
- **Wireframe Style**: Clean, professional wireframe aesthetics

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

1. **Add Components**: Drag components from the left sidebar to the canvas
2. **Position & Resize**: Drag to move, resize from corners
3. **Select Multiple**: Click canvas and drag to select multiple components, or Ctrl/Cmd+Click
4. **Edit Properties**: Select a component to edit its properties in the right panel
5. **Switch Viewports**: Use the viewport switcher to design for different screen sizes
6. **Adjust Canvas**: Click on canvas dimensions to customize width, height, and columns
7. **Save Project**: Auto-saves to localStorage, or export as JSON file
8. **Import Project**: Load previously exported JSON files

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
