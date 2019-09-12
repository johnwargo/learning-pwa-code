"use strict";
var express = require('express');
var router = express.Router();
router.post('/registration', function (req, res, next) {
    // Register a target device
    console.log('Router: POST /push/registration');
});
router.get('/registration/key', function (req, res, next) {
    // Get details for a registration
    console.log('Router: GET /push/registration');
});
router.delete('/registration', function (req, res, next) {
    // Delete a registration
    console.log('Router: DELETE /push/registration');
});
router.put('/registration', function (req, res, next) {
    // Update a registration
    console.log('Router: PUT /push/registration');
});
router.get('/registrations', function (req, res, next) {
    // get the full list of registrations from the database
    console.log('Router: GET /push/registration');
});
router.post('/send', function (req, res, next) {
    console.log('Router: POST /push/send');
});
module.exports = router;
