const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_orders, directus_count_orders, directus_retrieve_user, control_service_data, directus_update_user } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_account_details"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 4
const blocname = tabside[idbloc].texte
const pagename = "Détail du compte"
const template = "account_details"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  let user_connected = null
  let r_dts_user = await directus_retrieve_user(req.session.userdata.email)
  if (r_dts_user.success) {
    user_connected = r_dts_user.data
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
    user_connected: user_connected
  })
});

router.post('/', async function (req, res, next) {
  let user_connected = null
  let r_dts_user = await directus_retrieve_user(req.session.userdata.email)
  if (r_dts_user.success) {
    user_connected = r_dts_user.data
  }

  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {
    let r_dts_user = await directus_retrieve_user(body.email)

    if (!r_dts_user.success || r_dts_user.data.id == user_connected.id) {
      let user_data = {
        id: user_connected.id,
        phone: body.phone,
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email
      }
      let r_dts_update_user = await directus_update_user(user_data)

      if (r_dts_update_user.success) {
        req.session.userdata = r_dts_update_user.data
        res.redirect(routedebase + "/user_management/" + template)
      } else {
        error = r_dts_update_user.message
      }

    } else {
      error = r_dts_user.message
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
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
      user_connected: user_connected,
      rbody: body,
      error: error
    })
  }
});

module.exports = router;