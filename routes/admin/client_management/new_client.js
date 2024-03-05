const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genUserCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_orders, directus_count_orders, directus_retrieve_user, directus_create_client, control_service_data } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_new_client"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 2
const blocname = tabside[idbloc].texte
const pagename = "Nouveau client"
const template = "client_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  res.render(
    profile + "/client_management/new_client", {
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
  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {

    let r_dts_new_client = await directus_create_client({
      lastname: body.lastname,
      firstname: body.firstname,
      email: body.email,
      phone: body.phone,
    })

    if (r_dts_new_client.success) {
      res.redirect(routedebase + "/client_management/client_list")
    } else {
      error = r_dts_new_client.message
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
    res.render(
      profile + "/client_management/new_client", {
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
      rbody: body,
      error: error
    })
  }
});

module.exports = router;