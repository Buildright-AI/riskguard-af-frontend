# Elysia Frontend

![Elysia](./public/logo.svg)

Elysia is a modern AI-powered platform built as a single-page application (SPA) that provides an intuitive interface for AI interactions, data exploration, and configuration management. This frontend application serves as the user interface for the broader Elysia ecosystem.

## 🏗️ Built With

**Framework & Core Technologies:**

- **Next.js 14** - React framework with App Router
- **React 18** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework

**UI Libraries & Components:**

- **Radix UI** - Accessible, unstyled UI primitives
- **Shadcn** - Beautiful & consistent component library
- **Framer Motion** - Production-ready motion library
- **React Markdown** - Markdown component for React
- **React Syntax Highlighter** - Syntax highlighting component

**3D Graphics & Visualization:**

- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **React Three Postprocessing** - Postprocessing effects

**Data Visualization:**

- **Recharts** - Composable charting library
- **XYFlow React** - Flow chart and node-based UI library

**Development Tools:**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Cross-env** - Cross-platform environment variables

## 📋 Requirements

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- Modern web browser with ES2017+ support

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd elysia-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
elysia-frontend/
├── app/                          # Next.js app directory
│   ├── api/                      # API route handlers
│   ├── components/               # React components
│   │   ├── chat/                 # Chat-related components
│   │   │   ├── components/       # Shared chat components
│   │   │   ├── displays/         # Various display types
│   │   │   └── nodes/            # Flow node components
│   │   ├── configuration/        # Settings and config components
│   │   ├── contexts/             # React context providers
│   │   ├── debugging/            # Debug tools and utilities
│   │   ├── dialog/               # Modal and dialog components
│   │   ├── evaluation/           # Evaluation and feedback components
│   │   ├── explorer/             # Data exploration components
│   │   ├── navigation/           # Navigation and sidebar components
│   │   └── threejs/              # 3D graphics components
│   ├── pages/                    # Main page components
│   ├── types/                    # TypeScript type definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Homepage component
├── components/                   # Shared UI components
│   └── ui/                       # Reusable UI primitives
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── public/                       # Static assets
└── configuration files           # Config files (tsconfig, tailwind, etc.)
```

### Key Directories Explained:

- **`app/api/`** - Contains server-side API routes for backend communication
- **`app/components/`** - Core application components organized by feature
- **`app/pages/`** - Main page components (Chat, Data, Settings, etc.)
- **`app/types/`** - TypeScript interfaces and type definitions
- **`components/ui/`** - Reusable UI components built with Radix UI
- **`hooks/`** - Custom React hooks for shared logic
- **`public/`** - Static files like images and icons

## 🎯 Application Features

### Single Page Application (SPA)

Elysia is built as a SPA using Next.js with client-side routing. The main navigation happens through React context (`RouterContext`) without page reloads, providing a smooth user experience.

### Main Sections:

- **Chat** - AI conversation interface
- **Data** - Data exploration and visualization
- **Settings** - Configuration management
- **Evaluation** - AI model evaluation tools
- **Explorer** - Advanced data browsing

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build           # Build for production
npm run build:clean     # Clean build (removes cache first)

# Export & Assembly
npm run export          # Export static files to backend
npm run assemble        # Build and export in one command
npm run assemble:clean  # Clean build and export

# Other
npm start              # Start production server
npm run lint           # Run ESLint
```