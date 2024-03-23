const express = require('express');
const axios = require('axios');

const { getMoment, getDirectusUrl, getRouteDeBase } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION, DEFAULT_ROUTE_CLIENT, USERPROFILE_TYPE_CLIENT, USERPROFILE_TYPES, DEFAULT_ROUTE_ADMIN, USERPROFILE_TYPE_ADMIN, DEFAULT_ROUTE_INTERMED } = require('../../config/consts');
const { control_service_data, directus_retrieve_user, directus_verify_hash, directus_create_connection_history } = require('../../config/global_functions');
const router = express.Router();

const SERVICE_TYPE = "security_login"

const urlapi = getDirectusUrl();
const moment = getMoment();
const service = "security"

router.get('/', async function (req, res, next) {
  if (req.session.userdata) {
    let route = req.session.userdata.profile == USERPROFILE_TYPE_CLIENT ? DEFAULT_ROUTE_CLIENT : DEFAULT_ROUTE_ADMIN
    res.redirect(route)
  } else {
    res.render(
      "security/login", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service
    })
  }
});

router.post('/', async function (req, res, next) {
  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {
    let r_dts_user = await directus_retrieve_user(body.email)

    if (r_dts_user.success) {
      let user_data = r_dts_user.data

      let r_dts_verify_hash = await directus_verify_hash(body.password, user_data.password)

      if (r_dts_verify_hash.success) {

        if (USERPROFILE_TYPES.includes(user_data.profile) && user_data.status) {
          let r_dts_new_connection_history = await directus_create_connection_history(user_data)

          if (r_dts_new_connection_history.success) {
            req.session.userdata = user_data
            let route = user_data.profile == USERPROFILE_TYPE_ADMIN ? DEFAULT_ROUTE_ADMIN : DEFAULT_ROUTE_INTERMED
            console.log("Redirecting to: " + route);
            res.redirect(route)
          } else {
            error = r_dts_new_connection_history.message
          }

        } else {
          error = "Vous n'êtes pas autorisé à vous connecter."
        }

      } else {
        error = r_dts_verify_hash.message
      }

    } else {
      error = r_dts_user.message
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
    res.render(
      "security/login", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      rbody: body,
      error: error
    })
  }
});

module.exports = router;