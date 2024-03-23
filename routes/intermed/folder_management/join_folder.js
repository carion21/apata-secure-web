const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger } = require('../../../config/utils');
const { DEFAULT_PROFILE_INTERMED, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_retrieve_user, directus_retrieve_folder, directus_create_folder_actor } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_join_folder"

const profile = DEFAULT_PROFILE_INTERMED;
const tabside = getTabSideBase(profile)
const idbloc = 2
const blocname = tabside[idbloc].texte
const pagename = "Joindre un folder"
const template = "folder_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

router.get('/:folder_id', async function (req, res, next) {
  let folder_id = req.params.folder_id

  console.log(req.params);

  if (isInteger(parseInt(folder_id))) {
    folder_id = parseInt(folder_id)
    let r_dts_folder = await directus_retrieve_folder(folder_id)

    if (r_dts_folder.success && r_dts_folder.data.length == 1) {
      let folder = r_dts_folder.data[0]
      let xdata = {
        folder: folder.id,
        actor: req.session.userdata.id,
        joined_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      }

      let r_dts_new_folder_actor =  await directus_create_folder_actor(xdata)

      if (r_dts_new_folder_actor.success) {
        console.log("Folder actor created: " + r_dts_new_folder_actor.data.id);
      } else {
        console.log("Error while creating folder actor: " + r_dts_new_folder_actor.message);
      }
      
    } else {
      console.log("Error while retrieving folder data: " + r_dts_folder.message);
    }
  } else {
    console.log("folder_id is not an integer: " + folder_id);
  }

  res.redirect(routedebase + "/folder_management/folder_list")
});

router.post('/', async function (req, res, next) {
  let result = {
    success: false
  }

  res.json(result)
});

module.exports = router;