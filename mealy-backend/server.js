const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');

const usersRouter = require('./routes/users.routes');
const recipesRouter = require('./routes/recipes.routes');
const mealplanRouter = require('./routes/mealplan.routes');
const authRouter = require('./routes/auth.routes');
const settingsRouter = require('./routes/settings.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// Routers are mounted twice: at the base path (original Assignment 2 paths)
// and under /api (the paths the Assignment 3 frontend spec expects).
const routers = [
  ['/users', usersRouter],
  ['/recipes', recipesRouter],
  ['/mealplan', mealplanRouter],
  ['/auth', authRouter],
  ['/settings', settingsRouter]
];
routers.forEach(([path, router]) => {
  app.use(path, router);
  app.use('/api' + path, router);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found.', details: {} }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', details: {} }
  });
});

app.listen(3000, () => {
  console.log('Mealy backend running on http://localhost:3000');
});
