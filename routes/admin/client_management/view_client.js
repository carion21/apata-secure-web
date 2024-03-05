const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_orders, directus_count_orders, directus_retrieve_user } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_view_client"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 2
const blocname = tabside[idbloc].texte
const pagename = "Détail d'un client"
const template = "client_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  res.render(
    profile + "/" + tabside[idbloc].elements[index].template, {
    appName: APP_NAME,
    appVersion: APP_VERSION,
    appDescription: APP_DESCRIPTION,
    profile: profile,
    blocname: blocname,
    pagename: pagename,
    page: page,
    template: template,
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