# Mealy Backend API

Express REST API with mock in-memory data. No database.

## Install & Run

```bash
npm install
node server.js
```

Server: `http://localhost:3000`  
Base path: `/`

## Assumptions

- IDs are numeric, auto-incremented starting from the seed value in each model file.
- Data resets on server restart - in-memory only, no persistence.
- Authentication is simulated via the `x-user-role` request header. No real JWT.
- `userRole` accepted values: `admin`, `manager`, `user`.

## Simulated Auth

Add header to requests that require a role:

```
x-user-role: admin
```

| Role | Allowed operations |
|---|---|
| `admin` | GET, POST, PUT, DELETE |
| `manager` | GET, POST, PUT |
| `user` | GET, POST |

---

## Response Envelope

**Success:**
```json
{ "success": true, "data": <object or array>, "error": null }
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "Human readable message", "details": {} }
}
```

---

## API Reference

### Users - `/users`

| Method | Path | Role | Body |
|---|---|---|---|
| GET | `/users` | any | - |
| GET | `/users/:id` | any | - |
| POST | `/users` | any | `{ firstName*, lastName*, userRole*, email, dietaryPreferences[] }` |
| PUT | `/users/:id` | admin, manager | `{ firstName*, lastName*, userRole*, email, dietaryPreferences[] }` |
| PUT | `/users/:id/preferences` | any | `{ dietaryPreferences[] }` |
| DELETE | `/users/:id` | admin | - |

`*` required

**GET `/users`** → `200`
```json
{
  "success": true,
  "data": [
    {
      "userId": 1, "firstName": "Matan", "lastName": "Noam",
      "email": "matan@mealy.com", "dietaryPreferences": ["vegetarian"],
      "createDate": "2025-01-10T10:00:00Z", "updateDate": "2025-01-10T10:00:00Z", "userRole": "admin"
    }
  ],
  "error": null
}
```

**POST `/users`** body: `{ "firstName": "Avi", "lastName": "Ben", "userRole": "user", "email": "avi@mealy.com" }` → `201`
```json
{ "success": true, "data": { "userId": 4 }, "error": null }
```

**PUT `/users/1/preferences`** body: `{ "dietaryPreferences": ["vegan", "nut-free"] }` → `200`
```json
{ "success": true, "data": { "userId": 1 }, "error": null }
```

**Error - 400 missing field:**
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Missing required field: firstName", "details": { "field": "firstName" } } }
```

**Error - 404 not found:**
```json
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "User not found.", "details": {} } }
```

**Error - 403 forbidden:**
```json
{ "success": false, "data": null, "error": { "code": "FORBIDDEN", "message": "You do not have permission to perform this action.", "details": {} } }
```

---

### Recipes - `/recipes`

| Method | Path | Role | Body |
|---|---|---|---|
| GET | `/recipes` | any | - |
| GET | `/recipes/:id` | any | - |
| POST | `/recipes` | any | `{ title*, instructions*, ingredients, prepTime, servings, cuisineType, tags }` |
| PUT | `/recipes/:id` | admin, manager | any recipe fields |
| DELETE | `/recipes/:id` | admin | - |
| POST | `/recipes/scan` | any | `{ imageUrl }` |

`*` required

**GET `/recipes/1`** → `200`
```json
{
  "success": true,
  "data": {
    "id": 1, "userId": 2, "title": "Shakshuka",
    "ingredients": [{ "name": "Eggs", "quantity": 4, "unit": "pcs" }],
    "instructions": "Heat oil, add tomatoes, crack eggs on top.",
    "prepTime": 20, "servings": 2, "isPublic": true,
    "cuisineType": "Middle Eastern", "tags": ["vegetarian", "quick"],
    "createDate": "2025-02-01T08:00:00Z"
  },
  "error": null
}
```

**POST `/recipes`** body: `{ "title": "Pasta", "instructions": "Boil pasta." }` → `201`
```json
{ "success": true, "data": { "id": 6 }, "error": null }
```

**POST `/recipes/scan`** body: `{ "imageUrl": "https://example.com/food.jpg" }` → `201`  
Returns a mock AI-detected recipe object.

**Error - 400:**
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Missing required field: title", "details": { "field": "title" } } }
```

---

### Meal Plans - `/mealplan`

| Method | Path | Role | Body |
|---|---|---|---|
| GET | `/mealplan` | any | - |
| GET | `/mealplan/:id` | any | - |
| POST | `/mealplan/generate` | any | `{ days, preferences[], recipeIds[] }` |
| POST | `/mealplan/generate/shoppinglist` | any | `{ planId }` |
| PUT | `/mealplan/:id/day` | any | `{ day*, meals*: [{recipeId, mealType, servings}] }` |
| DELETE | `/mealplan/:id` | admin | - |

**POST `/mealplan/generate`** body: `{ "days": 5, "recipeIds": [1, 2] }` → `201`
```json
{
  "success": true,
  "data": {
    "id": 3, "userId": 1,
    "planStartDate": "2026-04-26", "planEndDate": "2026-04-30",
    "planData": [{ "day": "Sunday", "meals": [{ "recipeId": 1, "mealType": "dinner", "servings": 2 }] }],
    "createdAt": "2026-04-26T10:00:00Z"
  },
  "error": null
}
```

**PUT `/mealplan/1/day`** body: `{ "day": "Monday", "meals": [{ "recipeId": 1, "mealType": "dinner", "servings": 3 }] }` → `200`
```json
{ "success": true, "data": { "id": 1 }, "error": null }
```

**POST `/mealplan/generate/shoppinglist`** body: `{ "planId": 1 }` → `200`
```json
{
  "success": true,
  "data": { "planId": 1, "items": [{ "name": "Eggs", "quantity": 8, "unit": "pcs" }] },
  "error": null
}
```

---

### Auth - `/auth`

| Method | Path | Body |
|---|---|---|
| POST | `/auth/register` | `{ firstName*, lastName*, email*, password*, preferences }` |
| POST | `/auth/login` | `{ email*, password* }` |

`*` required

**POST `/auth/login`** → `200`
```json
{ "success": true, "data": { "userId": 1, "token": "mock-jwt-token-abc123" }, "error": null }
```

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Validation error / invalid param |
| 403 | Forbidden - insufficient role |
| 404 | Resource not found |
| 500 | Unexpected server error |

---

## Files

- `docs/mealy.postman_collection.json` - import into Postman to test all endpoints
- `docs/screenshots/` - Postman test screenshots
