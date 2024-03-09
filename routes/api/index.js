const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
const router = express.Router();

const moment = getMoment();
const service = "api"

router.get('/', function (req, res, next) {
    res.render('index', { title: service });
});


module.exports = router;