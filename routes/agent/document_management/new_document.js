const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_AGENT, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_documents, directus_count_documents, directus_retrieve_user, directus_create_document, generate_qr_code, add_qr_code_to_pdf, directus_list_town_hall_document_types, control_service_data, directus_retrieve_town_hall_document_type } = require('../../../config/global_functions');
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

const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".pdf");
  },
});

// Define the maximum size for uploading
// picture i.e. 10 MB. it is optional
const maxSize = 10 * 1000 * 1000;

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    var filetypes = /pdf/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
      "following filetypes - " +
      filetypes
    );
  },

}).single("document");

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

router.post('/', async function (req, res, next) {
  let r_dts_document_types = await directus_list_town_hall_document_types()
  let document_types = []
  if (r_dts_document_types.success) {
    document_types = r_dts_document_types.data
  }

  let error = ""

  upload(req, res, async function (err) {
    let body = req.body

    if (err) {
      error = err.toString()
    } else {
      let bcontrol = control_service_data(SERVICE_TYPE, body)

      if (bcontrol.success) {
        let r_dts_document_type = await directus_retrieve_town_hall_document_type(body.document_type)

        if (r_dts_document_type.success) {
          const document_type = r_dts_document_type.data
          const fileName = req.file.filename

          let creation_date = moment().format("YYYY-MM-DD HH:mm:ss")
          let doc_code = genDocumentCode()

          let r_gen_qrcode = await generate_qr_code({
            stringdata: doc_code
          })

          if (r_gen_qrcode.success) {

            // get buffer from qrcode link
            let buff = await axios.get(r_gen_qrcode.link, {
              responseType: 'arraybuffer'
            })

            let inputFile = fileName
            let outputFile = "secure-" + fileName.replace("document-", "")
            add_qr_code_to_pdf(
              "public/uploads/" + inputFile,
              buff.data,
              doc_code,
              "public/uploads/" + outputFile
            )

            let doc_data = {
              code: doc_code,
              user: req.session.userdata.id,
              title: document_type.label,
              input_path: inputFile,
              output_path: outputFile,
              qrcode_link: r_gen_qrcode.link,
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

});

module.exports = router;