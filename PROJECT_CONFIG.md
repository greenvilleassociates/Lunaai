# LunaAI Project Configuration

## Technology Stack

### Core Dependencies

- **React**: `19.2.4` (exact version - latest)
- **React DOM**: `19.2.4` (exact version - latest)
- **Node.js**: `>=24.0.0` (specified in engines and .nvmrc)
- **Vite**: `6.3.5` (build tool and dev server)

### Build & Development

- **Vite**: Modern, fast build tool with Hot Module Replacement (HMR)
- **@vitejs/plugin-react**: Official React plugin for Vite
- **Tailwind CSS**: `4.1.12` with Vite plugin for styling
- **TypeScript**: Type-safe development

### UI Frameworks & Components

- **Material UI (MUI)**: `7.3.5`
  - @mui/material
  - @mui/icons-material
  - @emotion/react & @emotion/styled (peer dependencies)

- **Radix UI**: Comprehensive unstyled component library
  - Accordion, Dialog, Dropdown Menu, Tabs, Tooltip, and more
  
- **Lucide React**: Icon library (`0.487.0`)

### Routing

- **React Router**: `7.13.0` (using Data mode pattern)

### Forms & Validation

- **React Hook Form**: `7.55.0` (controlled form management)

### Animation

- **Motion**: `12.23.24` (formerly Framer Motion)

### Additional Libraries

- **Recharts**: `2.15.2` - Chart visualization
- **React DnD**: `16.0.1` - Drag and drop functionality
- **React Slick**: `0.31.0` - Carousel component
- **Date-fns**: `3.6.0` - Date utilities
- **Sonner**: `2.0.3` - Toast notifications
- **Ionic React**: `^8.8.1` - Mobile UI components

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/     # React components
│   │   ├── config/         # Configuration files (API, etc.)
│   │   ├── data/          # JSON data files
│   │   └── routes.tsx     # React Router configuration
│   └── styles/            # CSS and styling files
├── .nvmrc                 # Node version specification (24)
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
└── PROJECT_CONFIG.md      # This file
```

## Node.js Version Management

This project requires Node.js 24 or higher. Two files specify this:

1. **`.nvmrc`**: For Node Version Manager (nvm) users
   ```
   24
   ```

2. **`package.json` engines field**:
   ```json
   "engines": {
     "node": ">=24.0.0"
   }
   ```

### Using NVM (Node Version Manager)

```bash
# Install and use the specified Node version
nvm install
nvm use
```

## Development

### Installing Dependencies

```bash
npm install
# or
pnpm install
```

### Running the Development Server

```bash
npm run build
# or
pnpm build
```

The Vite dev server will start with hot module replacement enabled.

## Build Configuration

### Vite Configuration (`vite.config.ts`)

- **React Plugin**: Enables React Fast Refresh and JSX transformation
- **Tailwind CSS Plugin**: Integrates Tailwind v4 build process
- **Path Aliases**: `@` points to `./src` directory
- **Asset Includes**: Custom support for `.svg` and `.csv` files

### Key Features

1. **Hot Module Replacement (HMR)**: Fast refresh during development
2. **Optimized Builds**: Tree-shaking and code-splitting
3. **TypeScript Support**: Built-in TypeScript compilation
4. **CSS Processing**: Tailwind CSS v4 with modern features

## API Configuration

The application connects to Azure-hosted APIs:

- **Main Site**: `luna.capitoltechnology.net`
- **API Root**: `lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net`

API configuration is managed in `/src/app/config/api.ts`

## Styling

### Tailwind CSS v4

- Latest version with new features
- Custom theme tokens in `/src/styles/theme.css`
- Base styles in `/src/styles/index.css`
- Font imports in `/src/styles/fonts.css`

### Design System

- **Primary Colors**: Black (#1a1a1a) and dark red
- **Company**: Capitol Technology Solutions
- **Mobile-First**: Responsive design for all screen sizes

## Key Features

- ✅ Multi-LLM orchestration (ChatGPT, Claude AI)
- ✅ Complete authentication system with local JSON storage
- ✅ Comprehensive admin panel with tabbed interface
- ✅ AI Search with history tracking
- ✅ User management and company relationships
- ✅ Login tracking (time, geolocation, IP address)
- ✅ Role-based access control (superuser, company admin)
- ✅ Store, Region, and Manager management
- ✅ Application instance management
- ✅ Company events tracking
- ✅ User notifications and help ticketing
- ✅ Beautiful seaside-themed home page with AI search

## Browser Support

Modern browsers that support:
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- Native ESM (ES Modules)

## Package Manager

This project uses **pnpm** with specific overrides configured for Vite.

## License

Private project for Capitol Technology Solutions

## Component Versions

| Component | Version | Status |
|-----------|---------|--------|
| **Vite** | 6.3.5 | ✅ Latest |
| **Node.js** | >=24.0.0 | ✅ Specified |
| **React** | 19.2.4 | ✅ Latest |
| **React DOM** | 19.2.4 | ✅ Latest |
| **Tailwind CSS** | 4.1.12 | ✅ Latest |
| **Material UI** | 7.3.5 | ✅ Current |
| **TypeScript** | Enabled | ✅ Active |