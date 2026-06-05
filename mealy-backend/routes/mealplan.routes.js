const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mealplan.controller');
const { allowRoles } = require('../middleware/auth');

// Declare the specific paths before /:id so they are not captured as id params.
router.post('/generate/shoppinglist', ctrl.generateShoppingList);
router.post('/generate', ctrl.generate);

router.get('/', ctrl.getAll);
router.put('/:id/day', ctrl.updateDay);
router.get('/:id', ctrl.getById);
router.delete('/:id', allowRoles('admin'), ctrl.remove);

module.exports = router;
