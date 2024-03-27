const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
// const { QRCodeStyling } = require('qr-code-styling');
// import QRCodeStyling from "qr-code-styling";
require('node-self')

const QRCodeStyling = require('qr-code-styling');
const router = express.Router();

const moment = getMoment();
const service = "home"

router.get('/', async function (req, res, next) {

  // const qrCode = QRCodeStyling({
  //   width: 300,
  //   height: 300,
  //   type: "svg",
  //   data: "https://www.facebook.com/",
  //   image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  //   dotsOptions: {
  //     color: "#4267b2",
  //     type: "rounded"
  //   },
  //   backgroundOptions: {
  //     color: "#e9ebee",
  //   },
  //   imageOptions: {
  //     crossOrigin: "anonymous",
  //     margin: 20
  //   }
  // });

  // qrCode.append(document.getElementById("canvas"));
  // qrCode.download({ name: "qr", extension: "svg" });

  res.redirect('/security')
});


module.exports = router;