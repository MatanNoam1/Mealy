# Mealy

Meal-planning web app. Express REST API backend + React SPA frontend.

Team: Matan Noam & Or.

## Structure

```
mealy/
  mealy-backend/    Express REST API (Assignment 2)
  mealy-frontend/   React SPA (Assignment 3)
```

## Quick Start

### 1. Backend

```bash
cd mealy-backend
npm install
npm start
# Running at http://localhost:3000
```

### 2. Frontend

```bash
cd mealy-frontend
cp .env.example .env
npm install
npm start
# Running at http://localhost:5173
```

### Demo login

Any valid email + password of 6+ characters. Example:

```
Email:    matan@mealy.com
Password: 123456
```

## Backend - API Overview

Base URL: `http://localhost:3000/api`

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| GET | /users | List users (admin) |
| GET | /users/me | Current user |
| PUT | /users/me | Update own profile |
| PUT | /users/:id | Update any user (admin) |
| GET | /recipes | List recipes |
| POST | /recipes | Create recipe (admin) |
| DELETE | /recipes/:id | Delete recipe (admin) |
| POST | /recipes/scan | AI scan stub |
| GET | /mealplan | Get meal plan |
| POST | /mealplan/generate | AI generate stub |
| GET | /settings | Get settings |
| PUT | /settings | Update settings |

Auth via `x-user-id` header. Role-based access: `admin` vs `user`.

## Frontend - Pages

- `/login` - Login form
- `/` - Dashboard with recipe cards and data table
- `/settings` - User settings (username, email, theme, dietary prefs)

## Notes

- Backend is in-memory only - data resets on restart.
- AI endpoints (`/recipes/scan`, `/mealplan/generate`) are stubs.
- Postman collection: `mealy-backend/docs/mealy.postman_collection.json`
