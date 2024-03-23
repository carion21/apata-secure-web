const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode, generateHash } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_documents, directus_count_documents, directus_retrieve_user, directus_create_document, generate_qr_code, add_qr_code_to_pdf, directus_retrieve_document, directus_verify_hash } = require('../../../config/global_functions');
const router = express.Router();

const fs = require('fs');

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_auth_document"

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

  res.render(
    profile + "/document_management/auth_document", {
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
  let error = ""


  upload(req, res, async function (err) {
    let body = req.body
    if (err) {
      error = err.toString()
      res.render(
        profile + "/document_management/auth_document", {
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
    } else {
      const fileName = req.file.filename
      const code = body.code

      const r_dts_document = await directus_retrieve_document(code)
      const dts_document = r_dts_document.data.length == 1 ? r_dts_document.data[0] : null

      if (dts_document) {
        console.log(dts_document);
        // get buffer from qrcode link

        const docbuff = await fs.promises.readFile("public/uploads/" + dts_document.output_path)
        const hash = generateHash(docbuff)

        let r_dts_verify_hash = await directus_verify_hash(hash, dts_document.hash)

        console.log(r_dts_verify_hash);

        if (r_dts_verify_hash.success) {

          res.render(
            profile + "/document_management/auth_document", {
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
            message: "La signature du document est correcte"
          })

        } else {
          error = "La signature du document est incorrecte"
          res.render(
            profile + "/document_management/auth_document", {
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

      } else {
        error = "Code document not found"
        res.render(
          profile + "/document_management/auth_document", {
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

      // remove file
      fs.unlink("public/uploads/" + fileName, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })

    }
  });
});

module.exports = router;