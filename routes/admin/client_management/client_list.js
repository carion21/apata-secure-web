const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_orders, directus_count_orders, directus_retrieve_user, directus_list_clients } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_client_list"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 2
const blocname = tabside[idbloc].texte
const pagename = "Liste des clients"
const template = "client_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {
  let filters = {
    rexto_entity: req.session.userdata.rexto_entity
  }

  let clients = []
  let r_dts_clients = await directus_list_clients(filters)
  if (r_dts_clients.success) {
    clients = r_dts_clients.data
  }

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
    moment: moment,
    clients: clients
  })
});

router.post('/', async function (req, res, next) {
  let result = {
    success: false
  }

  res.json(result)
});

module.exports = router;