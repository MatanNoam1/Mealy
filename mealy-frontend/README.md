# Mealy - Frontend (Assignment 3)

React frontend for the Mealy meal-planning app, connected to the Express REST
API from Assignment 2. Built with create-react-app, axios and React Router.

Team: Matan & Or.

## API Base URL

The frontend dev server runs at:

```
http://localhost:5173
```

(`PORT=5173` in `.env`, per the assignment spec.)

It talks to the backend REST API (Assignment 2) at `http://localhost:3000`, with
all API paths under `/api`, e.g. `http://localhost:3000/api/recipes`. This is
configured in `.env` via `REACT_APP_API_BASE` and used by `src/services/api.js`.

## How to run

### 1. Start the backend (Assignment 2)

```bash
cd "../Assignment 2/Project/mealy-backend"
npm install
npm start          # serves http://localhost:3000
```

### 2. Start the frontend

```bash
cd mealy-frontend
npm install        # install dependencies
npm start          # opens http://localhost:5173
```

## Demo login

Auth is a mock backend: **any valid email + a password of at least 6 characters**
logs you in (as the seeded admin user, Matan Noam).

```
Email:    matan@mealy.com
Password: 123456
```

## What it does

- **Login** (`/login`) - email + password with client-side validation
  (valid email, password ≥ 6 chars), loading state, backend error message,
  redirect on success. `POST /api/auth/login`.
- **Navbar + Layout** - logo, navigation, Settings link, logged-in user name and
  Logout. `GET /api/users/me`, `POST /api/auth/logout`.
- **Footer** - team name, year, slogan; shown on all main pages.
- **Dashboard / Home** (`/`) - fetches recipes (`GET /api/recipes`), with
  loading / error / empty states. Renders reusable Cards and a data table.
- **Settings** (`/settings`) - loads current settings (`GET /api/settings`),
  edits Username, Email, Theme (light/dark) and dietary preferences, validates,
  and saves (`PUT /api/settings`) with loading / success / error states.

## Project structure

```
src/
  components/   Navbar, Footer, Card, DataTable, Layout, ProtectedRoute
  pages/        Login, Dashboard, Settings
  services/     api.js (axios) + auth/settings/recipes services
  context/      AuthContext (login state + localStorage persistence)
  App.js        routing configuration
```

## Notes

- Reusable `Card` is rendered once per recipe on the dashboard (≥ 3 instances).
- `DataTable` dynamically maps an array of backend recipes into table rows.
- Theme choice persists in `localStorage` and across reloads.
- Backend data is in-memory, so edits reset when the backend restarts.
