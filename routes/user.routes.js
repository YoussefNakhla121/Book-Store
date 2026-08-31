const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');


router.use(protect);


router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.put('/me/password', userController.updatePassword);

router.use(restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers);

router.route('/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;