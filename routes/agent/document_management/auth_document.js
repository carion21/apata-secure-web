const express = require("express");
const axios = require("axios");

const {
  getMoment,
  getTabSideBase,
  getRouteDeBase,
  getDirectusUrl,
  isInteger,
  genDocumentCode,
  generateHash,
} = require("../../../config/utils");
const {
  DEFAULT_PROFILE_ADMIN,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  NLIMIT,
  DEFAULT_PROFILE_AGENT,
} = require("../../../config/consts");
const { activeSidebare, getIndice } = require("../../../config/sidebare");
const {
  directus_list_documents,
  directus_count_documents,
  directus_retrieve_user,
  directus_create_document,
  generate_qr_code,
  add_qr_code_to_pdf,
  directus_retrieve_document,
  directus_verify_hash,
  auth_file_to_server,
} = require("../../../config/global_functions");
const router = express.Router();

const fs = require("fs");

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_auth_document";

const profile = DEFAULT_PROFILE_AGENT;
const tabside = getTabSideBase(profile);
const idbloc = 1;
const blocname = tabside[idbloc].texte;
const pagename = "Nouveau document";
const template = "document_list";
const routedebase = getRouteDeBase(profile);
const index = getIndice(tabside[idbloc].elements, template);
const page = tabside[idbloc].elements[index].texte;
activeSidebare(tabside[idbloc].elements, index);

const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", async function (req, res, next) {
  res.render(profile + "/document_management/auth_document", {
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
  });
});

router.post("/", upload.single("file"), async function (req, res, next) {
  let body = req.body;
  let error = "";
  let result = {
    success: false,
    message: "",
  };

  let creation_date = moment().format("YYYY-MM-DD HH:mm:ss");
  const file = req.file;
  const uploadResult = await auth_file_to_server(file, req.body.code);

  if (uploadResult.success) {
    result.success = true;
   

    res.render(profile + "/document_management/auth_document", {
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
      message: "La signature du document est correcte",
    });
  } else {
    error = "La signature du document est incorrecte";
    res.render(profile + "/document_management/auth_document", {
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
      error: error,
    });
  }
});

module.exports = router;
