const express = require('express');
const axios = require('axios');
const multer = require("multer");

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_AGENT, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { upload_file_to_server,  directus_create_document, directus_list_town_hall_document_types, control_service_data, directus_retrieve_town_hall_document_type } = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "agent_new_document"

const profile = DEFAULT_PROFILE_AGENT;
const tabside = getTabSideBase(profile)
const idbloc = 1
const blocname = tabside[idbloc].texte
const pagename = "Nouveau document"
const template = "document_list"
const routedebase = getRouteDeBase(profile)
const index = getIndice(tabside[idbloc].elements, template)
const page = tabside[idbloc].elements[index].texte
activeSidebare(tabside[idbloc].elements, index)

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



router.get('/', async function (req, res, next) {

  const r_dts_document_types = await directus_list_town_hall_document_types()
  let document_types = []
  if (r_dts_document_types.success) {
    document_types = r_dts_document_types.data
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
    document_types: document_types,
    moment: moment
  })
});

router.post('/', upload.single('document'), async function (req, res, next) {
  let r_dts_document_types = await directus_list_town_hall_document_types()
  let document_types = []
  if (r_dts_document_types.success) {
    document_types = r_dts_document_types.data
  }

  let result = {
    success: false,
    message: ""
  }

  let error = ""

  let body = req.body

 
    let bcontrol = control_service_data(SERVICE_TYPE, body)

    if (bcontrol.success) {
      let r_dts_document_type = await directus_retrieve_town_hall_document_type(body.document_type)

      if (r_dts_document_type.success) {
        const document_type = r_dts_document_type.data
        const fileName = req.file.filename

        let creation_date = moment().format("YYYY-MM-DD HH:mm:ss")
        let doc_code = genDocumentCode()

        const file = req.file;
        const uploadResult = await upload_file_to_server(file);


        if (uploadResult.success) {
          result.success = true;
          result.message = "Le document a été téléchargé avec succès.";

          

          let doc_data = {
            code: doc_code,
            user: req.session.userdata.id,
            title: document_type.label,
            input_path: uploadResult.data.baseObjectName ,
            output_path: uploadResult.data.secureObjectName,
            qrcode_link: uploadResult.data.qrCodeLink,
            created_at: creation_date
          }

          let r_dts_new_document = await directus_create_document(doc_data)

          if (r_dts_new_document.success) {
            res.redirect(routedebase + "/document_management/" + template)
          } else {
            error = r_dts_new_document.message
          }

        } else {
          error = r_gen_qrcode.message
        }
      } else {
        error = r_dts_document_type.message
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
      document_types: document_types,
      error: error
    })
  }

});

module.exports = router;