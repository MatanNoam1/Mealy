const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mealplan.controller');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id/day', ctrl.updateDay);
router.get('/:id', ctrl.getById);
router.patch('/:id', ctrl.patch);
router.delete('/:id', ctrl.remove);

module.exports = router;
