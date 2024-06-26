const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_documents,upload_file_to_server ,directus_count_documents, directus_retrieve_user, directus_create_document, generate_qr_code, add_qr_code_to_pdf } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_new_document"

const profile = DEFAULT_PROFILE_ADMIN;
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
    moment: moment
  })
});

router.post('/', upload.single('document'), async function (req, res, next) {
  let body = req.body
  let error = ""
  let result = {
    success: false,
    message: ""
  }


  let creation_date = moment().format("YYYY-MM-DD HH:mm:ss")
  const file = req.file;
  const uploadResult = await upload_file_to_server(file);

  if (uploadResult.success) {
    result.success = true;
    result.message = "Le document a été téléchargé avec succès.";

    let doc_data = {
      code: uploadResult.data.code,
      user: req.session.userdata.id,
      input_path: uploadResult.data.baseObjectName,
      output_path: uploadResult.data.secureObjectName,
      qrcode_link: uploadResult.data.qrCodeLink,
      created_at: creation_date,
    }

    let r_dts_new_document = await directus_create_document(doc_data)

    if (r_dts_new_document.success) {
      res.redirect(routedebase + "/document_management/" + template)
    } else {
      error = r_dts_new_document.message
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
        documentdata: req.session.documentdata,
        moment: moment,
        means: means,
        error: error
      })
    }

  } else {
    error = r_gen_qrcode.message
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
      error: error
    })
  }


});

module.exports = router;