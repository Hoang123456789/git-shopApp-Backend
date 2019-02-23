const express = require('express');
const router = express.Router();

const AdminControllers = require('../controllers/admin');

router.get('/password_table', AdminControllers.admin_get_passwordTable);

router.delete('/password_table/:id', AdminControllers.admin_delete_passwordTable);

module.exports = router;
