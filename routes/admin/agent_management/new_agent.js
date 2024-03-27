const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genUserCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_orders, directus_count_orders, directus_retrieve_user, directus_create_agent, control_service_data, directus_list_town_hall } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_new_agent"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 4
const blocname = tabside[idbloc].texte
const pagename = "Nouvel agent"
const template = "agent_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  const r_dts_town = await directus_list_town_hall()
  let towns = []
  if (r_dts_town.success) {
    towns = r_dts_town.data
  }

  res.render(
    profile + "/agent_management/new_agent", {
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
    towns: towns
  })
});

router.post('/', async function (req, res, next) {
  const r_dts_town = await directus_list_town_hall()
  let towns = []
  if (r_dts_town.success) {
    towns = r_dts_town.data
  }

  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {

    let r_dts_new_agent = await directus_create_agent({
      lastname: body.lastname,
      firstname: body.firstname,
      email: body.email,
      phone: body.phone,
      town_hall: parseInt(body.town)
    })

    if (r_dts_new_agent.success) {
      res.redirect(routedebase + "/agent_management/agent_list")
    } else {
      error = r_dts_new_agent.message
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
    res.render(
      profile + "/agent_management/new_agent", {
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
      towns: towns,
      rbody: body,
      error: error
    })
  }
});

module.exports = router;