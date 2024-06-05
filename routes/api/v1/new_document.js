const express = require('express');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer'); 
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genDocumentCode, generateHash } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN } = require('../../../config/consts');
const { directus_create_document, generate_qr_code, add_qr_code_to_pdf, convertImageToPdf, upload_file_to_server } = require('../../../config/global_functions');
const router = express.Router();

const moment = getMoment();

router.post('/:id', upload.single('document'), async function (req, res) {
  const id = req.params.id;
  let result = { success: false, message: "" };

  console.log("ID:", id);
  console.log("Uploaded file:", req.file);

  if (!isInteger(parseInt(id))) {
    result.message = "Identifiant utilisateur invalide";
    return res.status(400).json(result);
  }

  if (!req.file) {
    result.message = "Aucun fichier n'a été téléchargé.";
    return res.status(400).json(result);
  }

  try {
    const file = req.file;
    const uploadResult = await upload_file_to_server(file);
    console.log("Upload result:", uploadResult.data);
    if (uploadResult.success) {
      result.success = true;
      result.message = "Le document a été téléchargé avec succès.";
      let doc_data = {
        code: uploadResult.data.code,
        user: parseInt(id),
        input_path: uploadResult.data.baseObjectName,
        output_path: uploadResult.data.secureObjectName,
        qrcode_link: uploadResult.data.qrCodeLink,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        hash: uploadResult.data.secureHash,
      }

      let r_dts_new_document = await directus_create_document(doc_data)
      
    } else {
      result.message = uploadResult.message;
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Erreur lors du traitement du fichier:', err);
    res.status(500).json({ success: false, message: "Erreur lors du traitement du fichier" });
  }
});

module.exports = router;
