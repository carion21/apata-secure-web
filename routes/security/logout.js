const express = require('express');

const axios = require('axios');

const { getAppName, getMoment, getDirectusUrl, getAxiosConfig } = require('../../config/utils');
const { ROUTE_SECURITY_SIGNOUT } = require('../../config/consts');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();
const service = "security"

router.get('/', async function (req, res, next) {
  if (req.session.userdata) {
    req.session.destroy();
  }
  res.redirect('/security');

});


module.exports = router;