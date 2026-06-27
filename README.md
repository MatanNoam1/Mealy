# Mealy - Full Stack Meal Planner (Assignment 4)

Mealy is a meal-planning web app. Each user keeps their own recipe collection,
can share individual recipes with other users (who get notified live), and can
generate AI meal plans and recipe recommendations.

Stack: React frontend, Node.js + Express backend, MySQL database via the
Sequelize ORM, real-time updates with Socket.IO, and AI features powered by
Google Gemini.

Team: Matan Noam & Or Cohen.

## Project purpose

- Persistent, per-user recipe management (CRUD) backed by MySQL.
- Recipe sharing between users (many-to-many), with live notifications.
- AI: meal-plan generation, recipe recommendations, and recipe image scanning.

## Structure

```
mealy/
  frontend/                 React SPA (React Router, Axios, Socket.IO client)
    src/{components,pages,services,context}/
  backend/
    src/                    Express app, routes, controllers, sockets, services, utils
    models/                 Sequelize models + associations (index.js)
    migrations/             Schema migrations (sequelize-cli)
    seeders/                Demo data
    config/config.js        DB config (reads .env)
    docs/                   Postman collection
    docker-compose.yml      Optional local MySQL
```

## Prerequisites

- Node.js 18+ and npm
- A MySQL 8 server (local install, or use the bundled Docker setup)
- A Google Gemini API key for the AI features (https://aistudio.google.com/app/apikey)

## Database setup

You need a running MySQL server and a database named `mealy`.

Option A - use your own MySQL:
```sql
CREATE DATABASE mealy;
```

Option B - use Docker (from `backend/`):
```bash
docker compose up -d        # starts MySQL 8 on localhost:3306, db "mealy", root password "mealypass"
```

## Environment variables

Backend - copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Meaning |
|----------|---------|
| PORT | Backend port (default 3000) |
| CLIENT_URL | Frontend origin for CORS / Socket.IO (default http://localhost:5173) |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | MySQL connection |
| GEMINI_API_KEY | Google Gemini key (required for AI features) |
| GEMINI_MODEL | Gemini model (default gemini-2.0-flash) |

Frontend - copy `frontend/.env.example` to `frontend/.env`:

| Variable | Meaning |
|----------|---------|
| PORT | Dev server port (5173) |
| REACT_APP_API_BASE | Backend API base (http://localhost:3000/api) |

## Install & run

### 1. Backend

```bash
cd backend
cp .env.example .env        # then edit DB credentials + GEMINI_API_KEY
npm install
npm run db:migrate          # create the tables
npm run db:seed             # load demo users + recipes
npm start                   # http://localhost:3000
```

ORM setup details: models live in `backend/models/` and are loaded by
`models/index.js`, which initializes Sequelize from `config/config.js` (env
driven) and wires associations. `npm run db:reset` re-runs migrations + seeders
from scratch.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start                   # http://localhost:5173
```

### Demo login

All seeded users share the password `123456`:

| Email | Role |
|-------|------|
| matan@mealy.com | admin |
| dana@mealy.com | manager |
| yossi@mealy.com | user |

## Data model (ORM)

- **User** 1---* **Recipe** (a user owns many recipes) - one-to-many.
- **User** *---* **Recipe** through **RecipeShare** - many-to-many (sharing).
- **User** 1---* **MealPlan**.
- **User** 1---1 **Admin** (admin metadata for admin users).
- **RecipeShare** is the junction table: `(recipeId, sharedWithUserId, sharedByUserId)`.

All data persists in MySQL across server restarts.

## API endpoints

Base URL: `http://localhost:3000/api`. Every response uses the envelope
`{ success, data, error }`. The frontend identifies the user with the
`x-user-id` and `x-user-role` headers (set after login).

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Create account (bcrypt) |
| POST | /auth/login | Login, returns user + token |
| POST | /auth/logout | Logout |
| GET | /users, /users/:id | List / get users |
| GET | /users/me, PUT /users/me | Current user profile |
| POST/PUT/DELETE | /users... | Admin/manager user management |
| GET | /recipes | All recipes |
| GET | /recipes/mine | Current user's recipes |
| GET | /recipes/shared | Recipes shared with current user (JOIN) |
| POST | /recipes | Create (owner = current user) |
| PUT | /recipes/:id | Update (owner or admin/manager) |
| DELETE | /recipes/:id | Delete (owner or admin) |
| POST | /recipes/:id/share | Share with a user by email |
| DELETE | /recipes/:id/share/:userId | Unshare |
| GET | /mealplan, POST /mealplan | List / save meal plans |
| PUT | /mealplan/:id/day, DELETE /mealplan/:id | Edit / delete plan |
| GET | /settings, PUT /settings | Current user settings |
| POST | /ai/mealplan | AI meal-plan generation |
| POST | /ai/recommendations | AI recipe recommendations |
| POST | /ai/recipe-scan | AI recipe image scan (multipart image) |

Postman collection: `backend/docs/mealy.postman_collection.json`.

## WebSocket feature (Socket.IO)

Real-time recipe sharing. After login the client connects and emits `user:join`
to join its private room. The backend pushes these custom events to the affected
user (in addition to the built-in `connect` / `disconnect`):

- `recipe:shared` - a recipe was shared with you (appears live + toast).
- `recipe:unshared` - a shared recipe was removed.
- `recipe:updated` - a recipe shared with you was edited.
- `recipe:created` - own-tab sync when you add a recipe.

Demo: log in as two users in two tabs; share a recipe from one and watch it
appear instantly in the other's "Shared with me" section.

## AI feature (Google Gemini)

The Gemini API key lives only on the backend (`GEMINI_API_KEY`); the frontend
always calls Gemini through the backend. Three features:

1. **Meal-plan generation** (`/ai/mealplan`) - builds a multi-day plan from your
   recipes, slotting them by `mealType`, honoring a diversity setting, and
   scaling ingredient quantities to your target servings.
2. **Recipe recommendations** (`/ai/recommendations`) - suggests new recipes
   based on your dietary preferences and existing recipes.
3. **Recipe image scan** (`/ai/recipe-scan`) - upload a photo of a recipe and
   Gemini extracts a structured recipe that pre-fills the Add Recipe form.

## Frontend pages

- `/login` - login
- `/` - Dashboard: My Recipes (CRUD + share) and live "Shared with me"
- `/mealplans` - saved meal plans + AI generate form
- `/ai` - AI recipe recommendations
- `/settings` - profile, theme, dietary preferences

## Known limitations

- Auth uses an opaque session token (no full JWT verification); requests are
  scoped by the `x-user-id` / `x-user-role` headers.
- AI features require a valid `GEMINI_API_KEY`; without it those endpoints
  return a clear "AI not configured" error and the rest of the app still works.
- Seed recipes use placeholder image URLs, so their thumbnails fall back to an
  emoji tile.
