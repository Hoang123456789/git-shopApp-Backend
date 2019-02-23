const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const checkAdminAuth = require('../middleware/admin-auth');
const UsersControllers = require('../controllers/users');

router.post('/signup', UsersControllers.users_signup);

router.post('/login', UsersControllers.users_login);

router.get('/', checkAdminAuth, UsersControllers.users_get_all);

router.delete('/:userId', checkAdminAuth, UsersControllers.users_delete_user);

router.post('/forgot_password', UsersControllers.users_forgot_password);

router.post('/change_password/:hashedToken', UsersControllers.users_change_password);

module.exports = router;
