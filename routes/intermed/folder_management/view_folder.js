const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_INTERMED, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_retrieve_user, directus_retrieve_folder, directus_list_documents_by_folder } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "intermed_view_folder"

const profile = DEFAULT_PROFILE_INTERMED;
const tabside = getTabSideBase(profile)
const idbloc = 2
const blocname = tabside[idbloc].texte
const pagename = "Détail d'un folder"
const template = "folder_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/:folder_id', async function (req, res, next) {
  let folder_id = req.params.folder_id

  let error = ""
  let folder = null

  if (!isInteger(parseInt(folder_id))) {
    error = "Le paramètre folder_id est incorrect"
  } else {
    let r_dts_folder = await directus_retrieve_folder(folder_id)
    if (r_dts_folder.success && r_dts_folder.data.length == 1) {
      folder = r_dts_folder.data[0]

      let r_dts_documents = await directus_list_documents_by_folder(folder_id)

      if (r_dts_documents.success) {
        folder.documents = r_dts_documents.data
      } else {
        error = r_dts_documents.message
      }

    } else {
      error = r_dts_folder.message || "Le folder n'existe pas"
    }

  }

  console.log(folder);

  if (error != "") {
    console.log("error", error);
    res.redirect(routedebase + "/folder_management/folder_list")
    // res.redirect(routedebase + "/document_management/document_list")
  } else {
    res.render(
      profile + "/folder_management/view_folder", {
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
      folder: folder
    })
  }
});

router.post('/', async function (req, res, next) {
  let result = {
    success: false
  }

  res.json(result)
});

module.exports = router;