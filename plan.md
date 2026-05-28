# Implementation Plan: Chorale Notre Dame de la Paix de Béoumi Management App

This plan outlines the creation of a modern, responsive Single Page Application (SPA) for managing human resources and finances for the choir.

## Scope Summary
- **Dashboard**: KPI indicators, financial progress, and recent activity feed.
- **HR Management**: Member directory (filtering by voice group/status), member profile editing, and attendance tracking.
- **Financial Management**: Contribution tracking (monthly grid) and a general ledger (Income/Expenses).
- **Data Persistence**: Local state management (React `useState`/`useContext`) with `localStorage` for basic persistence across reloads.
- **Visuals**: Peace blue, white, and gold accents. Responsive design.

## Non-Goals
- Server-side database or Supabase integration.
- Authentication/Login (not requested, implied single-user/local use).
- Real-time collaboration.

## Assumptions
- The application is for internal use by a single administrator on a local device.
- All calculations (attendance rates, treasury balance) are done client-side.
- Standard contribution is 500 FCFA/month.

## Affected Areas
- `src/App.tsx`: Main navigation and layout.
- `src/components/`: New components for Dashboard, HR, and Finance.
- `src/context/`: Data context for managing members, transactions, and attendance.
- `src/index.css`: Theme colors and global styles.

## Phases

### Phase 1: Foundation & Data Layer
- Define TypeScript interfaces for `Member`, `Transaction`, and `Attendance`.
- Create a `StoreContext` to hold the application state.
- Implement `localStorage` synchronization for the state.
- Set up global theme colors in `src/index.css` (Blue: #1e3a8a, Gold: #d4af37).
- **Owner**: `frontend_engineer`

### Phase 2: Navigation & Layout
- Implement a responsive sidebar or bottom navigation (for mobile).
- Create a 3-tab structure: Dashboard, HR, Finance.
- **Owner**: `frontend_engineer`

### Phase 3: HR Management (HR & Presences)
- **Directory**: Table/Card view with filters for "Pupitre" and "Statut".
- **Member Form**: Add/Edit member modal (Nom, Prénom, Téléphone, Pupitre, Rôle).
- **Attendance Module**: Date picker and checklist for members (Present/Absent/Late).
- **Owner**: `frontend_engineer`

### Phase 4: Financial Management (Treasury)
- **Contributions Grid**: Matrix of members x months (Jan-Dec) with checkbox/toggle.
- **Ledger**: List of recent transactions and a form to add "Recette" or "Dépense".
- **Balance Logic**: Calculate total cash available based on all transactions.
- **Owner**: `frontend_engineer`

### Phase 5: Dashboard & Polish
- **KPI Cards**: Total active members, Avg attendance, Total cash.
- **Visuals**: Progress bar for financial goals.
- **Activity Feed**: Log the last 3 events (Member added, payment made).
- **Responsive Review**: Ensure all tables and forms work well on small screens.
- **Owner**: `quick_fix_engineer` (for final styling and UI tweaks)

## Sequencing
- Phase 1 is a prerequisite for all other phases.
- Phases 3 and 4 can be worked on concurrently if needed, but depend on Phase 2.
- Phase 5 requires the data logic from Phases 3 and 4 to be functional.
