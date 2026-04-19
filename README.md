# np-fin-calc-app

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**A modern, intuitive financial calculator application built with cutting-edge web technologies.**

[View Demo](#) • [Report Bug](https://github.com/nirmalya-iitkgp/np-fin-calc-app/issues) • [Request Feature](https://github.com/nirmalya-iitkgp/np-fin-calc-app/issues)

</div>

---

## ✨ Overview

np-fin-calc-app is a sophisticated financial calculator designed with developers and finance enthusiasts in mind. Built with modern React patterns, TypeScript for type safety, and Tailwind CSS for a sleek interface, this application delivers a premium user experience for performing complex financial calculations.

## 🚀 Key Features

- **⚡ Lightning Fast** - Powered by Vite for instant HMR and optimized builds
- **🎨 Modern UI** - Beautiful, responsive interface using Shadcn UI components
- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **🔒 Type-Safe** - 97.5% TypeScript for robust, maintainable code
- **🧪 Well-Tested** - Comprehensive test coverage with Vitest
- **♿ Accessible** - WCAG compliant with Radix UI primitives
- **🎭 Dark Mode** - Built-in theme switching with next-themes
- **📊 Advanced Charts** - Data visualization with Recharts

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Framework** | [React 18](https://react.dev/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://radix-ui.com/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **State Management** | [React Query](https://tanstack.com/query/latest) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Linting** | [ESLint](https://eslint.org/) |

## 📦 Project Structure

```
np-fin-calc-app/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper utilities
│   ├── styles/             # Global styles & Tailwind config
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── tests/                  # Test files
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nirmalya-iitkgp/np-fin-calc-app.git
   cd np-fin-calc-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (Vite default port)

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server with HMR
npm run preview         # Preview production build locally

# Building
npm run build           # Build for production (optimized)
npm run build:dev       # Build for development mode

# Code Quality
npm run lint            # Run ESLint to check code quality
npm run lint --fix      # Auto-fix ESLint issues

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
```

## 🧪 Testing

The project includes comprehensive unit tests using Vitest and React Testing Library.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📊 Code Quality

### TypeScript Coverage
- **97.5% TypeScript** - Ensures type safety across the codebase
- **Strict Mode Enabled** - Leverages TypeScript's strictest settings
- **Type-Safe Props** - All React props are properly typed

### Linting & Formatting
- ESLint configuration for consistent code style
- React Hooks best practices enforced
- TypeScript ESLint plugin for advanced type checking

## 🎨 Design System

This project uses **Shadcn UI** built on top of **Radix UI** primitives, providing:

- ✅ Fully accessible components
- ✅ Unstyled, fully customizable components
- ✅ Dark mode support
- ✅ Responsive design out of the box
- ✅ TypeScript support

### Component Libraries Included
- Dialogs & Modals
- Forms & Input Components
- Navigation Elements
- Data Display Components
- Feedback Components
- Layout Components

## 🌙 Dark Mode

Built-in theme switching powered by `next-themes`:

```tsx
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // Toggle between light and dark modes
}
```

## 📈 Performance

Optimized for production with:
- Code splitting and lazy loading
- Tree-shaking for minimal bundle size
- Optimized images and assets
- Production build analyzers available

## 🤝 Contributing

We love contributions! To get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/np-fin-calc-app.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, type-safe code
   - Add tests for new features
   - Follow the existing code style
   - Run `npm run lint` to check code quality

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Link any related issues
   - Request review from maintainers

## 📝 Code Style Guide

- Use TypeScript for all new code
- Follow React best practices (functional components, hooks)
- Keep components small and focused
- Write meaningful prop types
- Add JSDoc comments for complex functions
- Use const arrow functions for components
- Leverage Tailwind CSS utilities instead of custom CSS

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Issues
```bash
npm run build:dev
```

## 📄 License

This project is open source and available under the MIT License. See the LICENSE file for more details.

## 👨‍💻 Author

**Nirmalya Panigrahi**
- GitHub: [@nirmalya-iitkgp](https://github.com/nirmalya-iitkgp)
- Portfolio: https://nirmalya-iitkgp.github.io/

## 🙏 Acknowledgments

- [React Team](https://react.dev/) for the incredible framework
- [Shadcn](https://github.com/shadcnui) for the beautiful UI components
- [Radix UI](https://radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Vite Team](https://vitejs.dev/) for the blazing-fast build tool

## 📞 Support

If you need help or have questions:

- 📌 [Open an Issue](https://github.com/nirmalya-iitkgp/np-fin-calc-app/issues)
- 💬 Check existing discussions
- 📧 Feel free to reach out!

---

<div align="center">

**Made with ❤️ by [nirmalya-iitkgp](https://github.com/nirmalya-iitkgp)**

⭐ If you like this project, please consider giving it a star!

</div>
