const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_orders, directus_count_orders, directus_retrieve_user, control_service_data, directus_verify_hash, directus_update_user_password } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_security"

const profile = DEFAULT_PROFILE_ADMIN;
const tabside = getTabSideBase(profile)
const idbloc = 3
const blocname = tabside[idbloc].texte
const pagename = "Sécurité"
const template = "security"
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
  let user_connected = null
  let r_dts_user = await directus_retrieve_user(req.session.userdata.email)
  if (r_dts_user.success) {
    user_connected = r_dts_user.data
  }

  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {
    let user_data = r_dts_user.data
      let r_dts_verify_hash = await directus_verify_hash(body.current_password, user_data.password)

      if (r_dts_verify_hash.success) {

        if (body.new_password == body.confirm_new_password) {

          let r_dts_update_user = await directus_update_user_password({
            id: user_data.id,
            password: body.new_password
          })

          if (r_dts_update_user.success) {
            req.session.userdata = r_dts_update_user.data
            res.redirect('/security/logout')
          } else {
            error = r_dts_update_user.message
          }

        } else {
          error = "Les mots de passe ne correspondent pas."
        }

      } else {
        error = r_dts_verify_hash.message
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