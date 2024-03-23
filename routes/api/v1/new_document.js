const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode, generateHash } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const { directus_list_documents, directus_count_documents, directus_retrieve_user, directus_create_document, generate_qr_code, add_qr_code_to_pdf, convertImageToPdf } = require('../../../config/global_functions');
const router = express.Router();

const fs = require('fs');

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "api_new_document"

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
const { log } = require('console');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "." + file.originalname.split('.').pop());
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
    var filetypes = /pdf|jpeg|jpg|png/;

    var extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
      "following filetypes - " +
      filetypes
    );
  },

}).single("document");

router.post('/:id', async function (req, res, next) {
  const id = req.params.id

  let error = ""

  let result = {
    success: false
  }


  if (isInteger(parseInt(id))) {
    upload(req, res, async function (err) {
      if (err) {
        error = err.toString()
        result.message = error
      } else {
        let fileName = req.file.filename

        const fileExtension = fileName.split('.').pop()

        console.log(fileName);

        if (fileExtension != "pdf") {
          await convertImageToPdf("public/uploads/" + fileName, "public/uploads/" + fileName.replace(fileExtension, "pdf"))
        }
        fileName = fileName.replace(fileExtension, "pdf")

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
          const docbuff = await add_qr_code_to_pdf(
            "public/uploads/" + inputFile,
            buff.data,
            doc_code,
            "public/uploads/" + outputFile
          )

          //  docbuff = await fs.promises.readFile("public/uploads/" + outputFile)
          const hash  = generateHash(docbuff)

          console.log(hash);

          let doc_data = {
            code: doc_code,
            user: parseInt(id),
            input_path: inputFile,
            output_path: outputFile,
            qrcode_link: r_gen_qrcode.link,
            created_at: creation_date,
            hash: hash
          }

          let r_dts_new_document = await directus_create_document(doc_data)

          if (r_dts_new_document.success) {
            result.success = true
            result.message = "Document created"
          } else {
            error = r_dts_new_document.message
            result.message = error
          }

        } else {
          error = r_gen_qrcode.message
        }

      }

      if (error) {
        result.message = error
      }

      res.json(result);
    });
  } else {
    result.message = "Invalid user id"
    res.json(result);
  }

});

module.exports = router;