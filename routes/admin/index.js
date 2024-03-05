const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl } = require('../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, ORDER_STATUS_INITIATED, ORDER_STATUS_CANCELLED, ORDER_STATUS_SUPPORTED } = require('../../config/consts');
const { activeSidebare, getIndice } = require('../../config/sidebare');
const { directus_retrieve_user, directus_count_clients, directus_count_orders_by_status } = require('../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 0
const blocname = tabside[idbloc].texte
const pagename = "Tableau de bord"
const template = "index"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  let count_clients = 0

  res.render(
    profile + "/" + tabside[idbloc].elements[index].template, {
    appName: APP_NAME,
    appVersion: APP_VERSION,
    appDescription: APP_DESCRIPTION,
    profile: profile,
    blocname: blocname,
    pagename: pagename,
    page: page,
    routedebase: routedebase,
    tabside: tabside,
    userdata: req.session.userdata,
    moment: moment
  })
});

router.post('/', async function (req, res, next) {
  let result = {
    success: false
  }

  res.json(result)
});

module.exports = router;