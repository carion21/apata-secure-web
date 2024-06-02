var express = require('express');
var router = express.Router();

const { getMoment } = require('../../config/utils');

const moment = getMoment();

router.get('/', async function (req, res, next) {
    res.redirect('/security/login')
    }
);

module.exports = router;