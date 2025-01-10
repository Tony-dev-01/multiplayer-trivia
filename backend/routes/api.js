// paths to different parts of application
// map them to appropriate controllers

const express = require('express');
const router = express.Router();
const customerController = require('');
router.get('/customers', customerController.getAllCustomers);


module.exports = router;