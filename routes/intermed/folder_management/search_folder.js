const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_INTERMED, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_retrieve_user, control_service_data, directus_search_folder, directus_filter_folder_actor } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "intermed_search_folder"

const profile = DEFAULT_PROFILE_INTERMED;
const tabside = getTabSideBase(profile)
const idbloc = 2
const blocname = tabside[idbloc].texte
const pagename = "Recherche de folders"
const template = "folder_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/', async function (req, res, next) {

  res.render(
    profile + "/folder_management/search_folder", {
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

    let folders = []
    let r_dts_folders = await directus_search_folder(body.code)
    if (r_dts_folders.success) {
      folders = r_dts_folders.data
      let folder_ids = folders.map(folder => folder.id)
      let r_dts_folder_actors = await directus_filter_folder_actor(req.session.userdata.id, folder_ids)

      if (r_dts_folder_actors.success) {
        // put true if the folder is already joined by the user
        folders.forEach(folder => {
          let folder_actor = r_dts_folder_actors.data.find(folder_actor => folder_actor.folder == folder.id)
          if (folder_actor) {
            folder.joined = true
          } else {
            folder.joined = false
          }
        })
      } else {
        error = r_dts_folder_actors.message
      }
    }

    res.render(
      profile + "/folder_management/search_folder", {
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
      folders: folders
    })
  } else {
    error = bcontrol.message
  }

  if (error) {
    res.render(
      profile + "/folder_management/search_folder", {
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