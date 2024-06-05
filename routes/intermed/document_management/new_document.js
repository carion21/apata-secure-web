const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_INTERMED, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { upload_file_to_server, directus_list_documents, directus_count_documents, directus_retrieve_user, directus_create_document, generate_qr_code, add_qr_code_to_pdf, directus_list_intermed_folders, control_service_data } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "intermed_new_document"

const profile = DEFAULT_PROFILE_INTERMED;
const tabside = getTabSideBase(profile)
const idbloc = 1
const blocname = tabside[idbloc].texte
const pagename = "Nouveau document"
const template = "document_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



router.get('/', async function (req, res, next) {
  let filters = {
    actor: req.session.userdata.id
  }

  let folders = []
  let r_dts_folders = await directus_list_intermed_folders(filters)
  if (r_dts_folders.success) {
    folders = r_dts_folders.data
  }

  res.render(
    profile + "/document_management/new_document", {
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
    folders: folders
  })
});

router.post('/', upload.single('document'), async function (req, res, next) {
  let filters = {
    actor: req.session.userdata.id
  }

  let result = {
    success: false,
    message: ""
  }

  let folders = []
  let r_dts_folders = await directus_list_intermed_folders(filters)
  if (r_dts_folders.success) {
    folders = r_dts_folders.data
  }

  let message = ""
  let error = ""

  let body = req.body

  let bcontrol = control_service_data(SERVICE_TYPE, body)

  if (bcontrol.success) {
    const fileName = req.file.filename

    let creation_date = moment().format("YYYY-MM-DD HH:mm:ss")
    const file = req.file;
    const uploadResult = await upload_file_to_server(file);

    if (uploadResult.success) {
      result.success = true;
      result.message = "Le document a été téléchargé avec succès.";
      console.log("Upload result:", uploadResult.data);
      // get buffer from qrcode link


      let doc_data = {
        code: uploadResult.data.code,
        user: req.session.userdata.id,
        title: body.title,
        input_path: uploadResult.data.baseObjectName,
        output_path: uploadResult.data.secureObjectName,
        qrcode_link: uploadResult.data.qrCodeLink,
        created_at: creation_date,
        folder: parseInt(body.folder)
      }

      let r_dts_new_document = await directus_create_document(doc_data)

      if (r_dts_new_document.success) {
        message = "Document ajouté au folder avec succès"
      } else {
        error = r_dts_new_document.message
      }

    } else {
      error = r_gen_qrcode.message
    }
  } else {
    error = bcontrol.message
  }



  if (error) {
    res.render(
      profile + "/document_management/new_document", {
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
      folders: folders,
      error: error
    })
  } else {
    let vfolder = folders.find(folder => folder.id == body.folder)
    res.render(
      profile + "/document_management/new_document", {
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
      folders: folders,
      vfolder: vfolder,
      message: message
    })
  }
});

module.exports = router;