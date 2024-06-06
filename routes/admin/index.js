const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl } = require('../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, ORDER_STATUS_INITIATED, ORDER_STATUS_CANCELLED, ORDER_STATUS_SUPPORTED } = require('../../config/consts');
const { activeSidebare, getIndice } = require('../../config/sidebare');
const { directus_retrieve_user, directus_count_clients, directus_count_orders_by_status, directus_count_intermeds, directus_count_folders, directus_count_documents } = require('../../config/global_functions');
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
  let count_intermeds = 0
  let count_folders = 0
  let count_documents = 0

  let r_dts_clients = await directus_count_clients()
  if (r_dts_clients.success) {
    count_clients = r_dts_clients.count
  }

  let r_dts_intermeds = await directus_count_intermeds()
  if (r_dts_intermeds.success) {
    count_intermeds = r_dts_intermeds.count
  }

  let r_dts_folders = await directus_count_folders()
  if (r_dts_folders.success) {
    count_folders = r_dts_folders.count
  }

  let r_dts_documents = await directus_count_documents()
  if (r_dts_documents.success) {
    count_documents = r_dts_documents.count
  }

  const dashboard_data = [
    {
      label: "Clients",
      value: count_clients,
      mdcard: 6
    },
    {
      label: "Intervenants",
      value: count_intermeds,
      mdcard: 6
    },
    {
      label: "Folders",
      value: count_folders,
      mdcard: 6
    },
    {
      label: "Documents",
      value: count_documents,
      mdcard: 6
    }
  ];


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
    moment: moment,
    dashboard_data: dashboard_data
  })
});

router.post('/', async function (req, res, next) {
  let result = {
    success: false
  }

  res.json(result)
});

module.exports = router;