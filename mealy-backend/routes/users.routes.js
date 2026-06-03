const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users.controller');
const { allowRoles } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/me', ctrl.getMe); // before /:id so "me" is not treated as an id param
router.put('/me', ctrl.updateMe); // self-update of own profile (no admin gate)
router.put('/:id/preferences', ctrl.updatePreferences);
router.get('/:id', ctrl.getById);
router.put('/:id', allowRoles('admin', 'manager'), ctrl.update);
router.delete('/:id', allowRoles('admin'), ctrl.remove);

module.exports = router;
