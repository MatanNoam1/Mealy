const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');

// In-memory upload (max 8 MB) for the recipe image scan; we forward the bytes
// to Gemini and never write them to disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post('/mealplan', ctrl.mealplan);
router.post('/recommendations', ctrl.recommendations);
router.post('/recipe-scan', upload.single('image'), ctrl.recipeScan);

module.exports = router;
