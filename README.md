# eTracker

A premium Expense Tracker dashboard built with React, Vite, Tailwind CSS, and Recharts. Designed as a polished SaaS-style finance app with advanced analytics, responsive layouts, dark mode, and local data persistence.

## Features

- Modern dashboard UI with glassmorphism cards and gradients
- Dark mode and light mode support
- Transaction management with add, edit, delete, and search
- Transaction filters by type, category, date range, and sort order
- Analytics page with pie, bar, and line charts
- Settings page with JSON export/import and data reset
- Responsive mobile drawer navigation
- LocalStorage persistence for transactions, settings, dark mode, and filters
- Toast notifications and smooth animations with Framer Motion

## Screenshots

- Dashboard overview with key metrics
- Transaction list with filters and cards
- Analytics charts and summary cards
- Settings panel with export/import options

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/etracker.git
   cd etracker
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start development server
   ```bash
   npm run dev
   ```
4. Open the app in the browser
   - Visit `http://localhost:5173`

## Project Structure

- `src/`
  - `components/` – Shared UI components and modals
  - `context/` – Context API state management
  - `pages/` – Route pages: Dashboard, Transactions, Analytics, Settings
  - `data/` – Sample data and category definitions
  - `utils/` – Storage and formatting helpers
  - `App.jsx` – Main app layout and routing
  - `main.jsx` – React entry point
  - `index.css` – Tailwind global styles and theme support

## Deployment

This project is ready for Vercel deployment. Build the production bundle with:

```bash
npm run build
```

Then deploy using Vercel or any static hosting provider that supports Vite apps.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Context API
- React Router DOM
- React Icons
- Recharts
- Framer Motion
- React Hot Toast
- UUID

## License

MIT License
