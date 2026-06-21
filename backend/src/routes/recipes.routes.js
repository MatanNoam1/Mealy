const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipes.controller');

// Specific paths before /:id so they are not captured as an id param.
router.get('/mine', ctrl.getMine);     // current user's own recipes
router.get('/shared', ctrl.getShared); // recipes shared with the current user

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);    // owner or admin/manager (enforced in controller)
router.delete('/:id', ctrl.remove); // owner or admin (enforced in controller)

// Sharing (many-to-many). Ownership enforced in the controller.
router.post('/:id/share', ctrl.share);
router.delete('/:id/share/me', ctrl.removeSelf);   // recipient removes from their list (must be before /:userId)
router.delete('/:id/share/:userId', ctrl.unshare); // owner unshares with a specific user

module.exports = router;
