const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipes.controller');
const { allowRoles } = require('../middleware/auth');

// Declare /scan before /:id so it is not captured as an id param.
router.post('/scan', ctrl.scan);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', allowRoles('admin', 'manager'), ctrl.update);
router.delete('/:id', allowRoles('admin'), ctrl.remove);

module.exports = router;
