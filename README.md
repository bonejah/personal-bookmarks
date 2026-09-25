# 📑 Personal Bookmark Manager

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/Database-IndexedDB%20(Dexie)-34D399?style=flat-square)](https://dexie.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)

A modern, fast, and visually striking personal bookmark manager built with **React 18, Vite, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB)**. 

Organize your web links by customizable subjects (*Studies, News, AI, Weather, Dev, Work, etc.*) with automatic visual metadata detection for platforms like YouTube, LinkedIn, GitHub, Twitter/X, and news outlets.

---

## ✨ Key Features

- 🎯 **Organized by Subjects (Categories)**: Group bookmarks into categories like *Studies*, *News*, *AI*, *Weather*, *Work*, *Entertainment*, and *Dev & Tech*.
- 🎨 **Custom Subjects Management**: Easily create, edit (icon + accent color), or delete custom subjects with real-time UI updates.
- ⚡ **Smart URL Parser & Visual Display**:
  - **YouTube**: Auto-detects channels (`@channelName`) and videos, displaying custom channel badges and high-res video thumbnails.
  - **LinkedIn**: Formats profile names and company pages with dedicated brand badges.
  - **GitHub**: Extracts repository `owner/repo` names automatically.
  - **Twitter / X**: Clean formatting for `@username` handles.
  - **Weather & News**: Automatic classification and high-resolution favicon extraction for any website.
- 💾 **100% Local Storage (IndexedDB via Dexie.js)**: All data is stored securely in your browser's IndexedDB. Zero backend setup required, lightning-fast queries, and total privacy.
- 📥 **Backup & Restore (JSON)**: Export your entire bookmark library to a `.json` backup file or restore it anytime with one click.
- ☀️ / 🌙 **Light & Dark Theme**: Toggle between sleek dark glassmorphism and an eye-friendly soft slate light theme with `localStorage` persistence.
- 🔍 **Real-Time Live Search**: Instant filtering by title, URL, tag, or domain name.
- 📌 **Bookmark Controls**: Pin important links to top, copy URLs with 1-click feedback, edit notes, or delete bookmarks.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Glassmorphism UI |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Local Database** | [Dexie.js](https://dexie.org/) (IndexedDB wrapper) + `dexie-react-hooks` |
| **Routing / SPA** | Vercel rewrite configuration ([`vercel.json`](./vercel.json)) |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/personal-bookmark.git
   cd personal-bookmark
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

You can preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Deploy to Vercel

Since the database runs 100% in the user's browser, you can deploy this app to Vercel for free in seconds!

### Option 1: Vercel CLI

```bash
npx vercel
```

Follow the prompts, then run for production:

```bash
npx vercel --prod
```

### Option 2: GitHub Repository

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. Import the repository in [Vercel Dashboard](https://vercel.com/dashboard).
3. Vercel will auto-detect Vite (`Build: npm run build`, `Output: dist`). Click **Deploy**!

---

## 📂 Project Structure

```text
personal-bookmark/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AddBookmarkModal.tsx    # Modal to paste URL & auto-detect metadata
│   │   ├── AddCategoryModal.tsx    # Modal to create custom subjects
│   │   ├── BookmarkCard.tsx        # Card component with platform badges & thumbnails
│   │   ├── BookmarkGrid.tsx        # Grid container with sorting & platform filters
│   │   ├── CategoryIcon.tsx        # Dynamic Lucide icon mapper
│   │   ├── EditBookmarkModal.tsx   # Modal to edit bookmark info
│   │   ├── EditCategoryModal.tsx   # Modal to edit subject name, icon & color
│   │   ├── ExportImportModal.tsx   # Modal to download or restore JSON backups
│   │   ├── Navbar.tsx              # Header with search, theme toggle & backup button
│   │   ├── PlatformIcons.tsx       # SVG brand icons (YouTube, LinkedIn, GitHub, X)
│   │   └── Sidebar.tsx             # Subject list navigation with edit/delete actions
│   ├── db/
│   │   └── database.ts             # Dexie.js IndexedDB schema & seed data
│   ├── types/
│   │   └── bookmark.ts             # TypeScript interfaces for Category & Bookmark
│   ├── utils/
│   │   ├── exportImport.ts         # JSON backup export & import functions
│   │   └── urlParser.ts            # Smart URL metadata & platform parser
│   ├── App.tsx                     # Main application layout & theme state
│   ├── index.css                   # Tailwind CSS v4 & theme variables
│   └── main.tsx                    # Entry point
├── vercel.json                     # Vercel SPA rewrite rules
├── vite.config.ts                  # Vite configuration
└── package.json
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
