const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genUserCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_retrieve_user, directus_create_intermed, control_service_data, directus_list_projects, directus_list_profiles } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_new_intermed"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 3
const blocname = tabside[idbloc].texte
const pagename = "Nouveau intermediaire"
const template = "intermed_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  const r_dts_projects = await directus_list_projects({})
  const projects = r_dts_projects.data
  const r_dts_profiles = await directus_list_profiles({})
  const profiles = r_dts_profiles.data

  res.render(
    profile + "/intermed_management/new_intermed", {
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
    projects: projects,
    profiles: profiles
  })
});

router.post('/', async function (req, res, next) {
  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {

    let r_dts_new_intermed = await directus_create_intermed({
      aps_project: parseInt(body.project),
      aps_profile: parseInt(body.profile),
      lastname: body.lastname,
      firstname: body.firstname,
      email: body.email,
      phone: body.phone,
    })

    if (r_dts_new_intermed.success) {
      res.redirect(routedebase + "/intermed_management/intermed_list")
    } else {
      error = r_dts_new_intermed.message
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
    res.render(
      profile + "/intermed_management/new_intermed", {
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