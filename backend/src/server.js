require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const logger = require('./middleware/logger');
const db = require('../models');
const initSockets = require('./sockets');

const usersRouter = require('./routes/users.routes');
const recipesRouter = require('./routes/recipes.routes');
const mealplanRouter = require('./routes/mealplan.routes');
const authRouter = require('./routes/auth.routes');
const settingsRouter = require('./routes/settings.routes');
const aiRouter = require('./routes/ai.routes');

const PORT = Number(process.env.PORT) || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

// Socket.IO shares the HTTP server. Stored on the app so controllers can emit.
const io = new Server(server, { cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] } });
app.set('io', io);
initSockets(io);

app.use(cors());
app.use(express.json());
app.use(logger);

// Each router is mounted on its base path and again under /api, so both the
// original Assignment 2 routes and the frontend's /api paths resolve.
const routers = [
  ['/users', usersRouter],
  ['/recipes', recipesRouter],
  ['/mealplan', mealplanRouter],
  ['/auth', authRouter],
  ['/settings', settingsRouter],
  ['/ai', aiRouter]
];
routers.forEach(([basePath, router]) => {
  app.use(basePath, router);
  app.use('/api' + basePath, router);
});

// In production, serve the compiled React frontend from this same server so the
// whole app deploys as one service. The build lives at ../../frontend/build.
const FRONTEND_BUILD = path.join(__dirname, '../../frontend/build');
app.use(express.static(FRONTEND_BUILD));
// Any non-API GET falls through to the React entry point so client-side routing
// (react-router) works on refresh. Express 5 needs a RegExp here, not '*'.
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD, 'index.html'));
});

// Catch-all for unmatched routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found.', details: {} }
  });
});

// Last-resort error handler so unexpected failures return a clean 500.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', details: {} }
  });
});

// Verify the database connection before accepting traffic.
db.sequelize
  .authenticate()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Mealy backend running on http://localhost:${PORT}`);
      console.log(`Socket.IO ready (CORS origin: ${CLIENT_URL})`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database. Check your .env settings.');
    console.error(err.message);
    process.exit(1);
  });
