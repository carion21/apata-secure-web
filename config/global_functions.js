const { SERVICE_TYPES_FIELDS, ROUTE_OF_DIRECTUS_FOR_USER, ROUTE_OF_DIRECTUS_FOR_CONNECTION_HISTORY, ROUTE_OF_DIRECTUS_TO_VERIFY_HASH, USERPROFILE_TYPE_CLIENT, ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT, QRGENERATOR_URL, ROUTE_OF_QRGENERATOR_TO_GENERATE,  } = require("./consts")
const { isString, isInteger, isBoolean, isObject, isArray, isNumber, isArrayOfString, isArrayOfInteger, getMoment, getDirectusUrl, genUserCode } = require("./utils")

const axios = require('axios');
const validator = require('email-validator');

const { PDFDocument, rgb } = require('pdf-lib');
const qr = require('qr-image');
const fs = require('fs');

const urlapi = getDirectusUrl();
const moment = getMoment()


const control_service_data = ((service_type_value, service_data) => {
  let result = {
    success: false
  }

  let error = ""

  try {
    if (isObject(service_data)) {
      let authorized_services = Object.keys(SERVICE_TYPES_FIELDS)

      if (authorized_services.includes(service_type_value)) {
        if (service_type_value == "undefined") {
          result.success = true
        } else {
          let rcontrol_basic = execute_service_basic_control_field(service_type_value, service_data)

          if (rcontrol_basic.success) {
            result.success = true
          } else {
            error = rcontrol_basic.message
          }
        }
      } else {
        error = "service_type is not valid or not implemented"
      }
    } else {
      error = "service_data must be an object"
    }
  } catch (err) {
    error = "big error when controlling service data : " + err.toString()
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const execute_service_basic_control_field = ((service_type_value, service_data) => {
  let result = {
    success: false
  }

  let error = ""

  try {
    let data_fields = Object.keys(service_data)
    let data_values = Object.values(service_data)

    let authorized_fields = SERVICE_TYPES_FIELDS[service_type_value].fields
    let authorized_types = SERVICE_TYPES_FIELDS[service_type_value].types

    let present_fields = data_fields.filter(field => authorized_fields.includes(field))
    let present_types = present_fields.map(field => authorized_types[authorized_fields.indexOf(field)])

    let required_fields = SERVICE_TYPES_FIELDS[service_type_value].required
    // let required_types = required_fields.map(field => authorized_types[authorized_fields.indexOf(field)])
    // verify if each element of required_fields is in data_fields
    if (required_fields.every(field => data_fields.includes(field))) {
      let rcontrol_fields_type = control_fields_type(present_fields, present_types, data_fields, data_values)

      if (rcontrol_fields_type.success) {
        result.success = true
      } else {
        error = rcontrol_fields_type.message
      }
    } else {
      error = "the authorized fields for service_type " + service_type_value + " are : " + authorized_fields.join(", ")
    }
  } catch (err) {
    error = "big error while executing service basic control field : " + err.toString()
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const control_fields_type = ((rfields, rtypes, dfields, dvalues) => {
  let result = {
    success: false
  }

  let error = ""

  result.success = true

  for (let i = 0; i < rfields.length; i++) {
    const field = rfields[i];
    const ftype = rtypes[i];
    const index = dfields.indexOf(field)
    if (index != -1) {
      const value = dvalues[index];
      let rcontrol_field_type = control_field_type(field, value, ftype)
      if (!rcontrol_field_type.success) {
        error = rcontrol_field_type.message
        result.success = false
        break;
      }
    } else {
      error = "the field " + field + " is required"
      result.success = false
      break;
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const control_field_type = ((field, value, field_type) => {
  let result = {
    success: false
  }

  let error = ""

  switch (field_type) {
    case "string":
      if (isString(value) && value != "") {
        result.success = true
      } else {
        error = "the field " + field + " must be a string"
      }
      break;
    case "string_not_empty":
      if (isString(value) && value != "") {
        result.success = true
      } else {
        error = "the field " + field + " must be a string and not empty"
      }
      break;
    case "string_email":
      if (isString(value) && value != "") {
        if (validator.validate(value)) {
          result.success = true
        } else {
          error = "the field " + field + " must be a string email"
        }
      } else {
        error = "the field " + field + " must be a string and not empty"
      }
      break;
    case "string_date":
      if (isString(value) && value != "") {
        if (moment(value, "YYYY-MM-DD HH:mm:ss").isValid() || moment(value, "YYYY-MM-DD").isValid()) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be a string date"
      }
      break;
    case "string_boolean":
      if (isString(value) && value != "") {
        if (value == "true" || value == "false") {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be a string boolean"
      }
      break;
    case "string_integer":
      if (isString(value) && value != "") {
        if (isInteger(parseInt(value))) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be a string integer"
      }
      break;
    case "integer":
      if (isInteger(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an integer"
      }
      break;
    case "boolean":
      if (isBoolean(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be a boolean"
      }
      break;
    case "object":
      if (isObject(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an object"
      }
      break;
    case "array":
      if (isArray(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an array"
      }
      break;
    case "number":
      if (isNumber(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be a number"
      }
      break;
    case "array_of_string":
      if (isString(value)) {
        value = [value]
      }
      if (isArrayOfString(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an array of string"
      }
      break;
    case "array_of_integer":
      if (isInteger(value)) {
        value = [value]
      }
      if (isArrayOfInteger(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an array of integer"
      }
      break;
    case "array_of_string_integer":
      if (isArrayOfString(value)) {
        if (value.every(element => isInteger(parseInt(element)))) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be an array of string integer"
      }
      break;
    case "undefined":
      result.success = true
      break;
    default:
      error = "the field " + field + " has an unknown type"
      break;
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const generate_qr_code = (async (data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = QRGENERATOR_URL + ROUTE_OF_QRGENERATOR_TO_GENERATE

  try {
    let response = await axios.post(urlcomplete, data)
    if (response.status == 200 && response.data.status == "success") {
      let rdata = response.data
      result.success = true
      result.link = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const add_qr_code_to_pdf = (async (pdfPath, qrCodeBuffer, qrCodeText, outputPath) => {
  // Charger le PDF
  const pdfBytes = await fs.promises.readFile(pdfPath);

  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  // Créer le code QR
  // const qr_png = qr.imageSync(qrCodeText, { type: 'png' });
  // console.log(qr_png);
  const qrImage = await pdfDoc.embedPng(qrCodeBuffer);

  // Parcourir chaque page du PDF
  for (let i = 0; i < pages.length; i++) {
      const { width, height } = pages[i].getSize();
      const qrCodeSize = 50; // Taille du code QR
      const x = width - qrCodeSize - 10; // 20 pixels de marge depuis le bord droit
      const y = 10; // 20 pixels de marge depuis le bord supérieur

      // Ajouter le code QR à la page
      pages[i].drawImage(qrImage, {
          x,
          y,
          width: qrCodeSize,
          height: qrCodeSize,
      });
  }

  // Écrire le fichier PDF de sortie
  const modifiedPdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(outputPath, modifiedPdfBytes);
})

const directus_retrieve_user = (async (username) => {
  let result = {
    success: false
  }
  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "?filter[username][_eq]=" + username
  try {
    let response = await axios.get(urlcomplete)
    if (response.status == 200) {
      let rdata = response.data
      if (rdata.data.length == 1) {
        result.success = true
        result.data = rdata.data[0]
      } else {
        error = "L'utilisateur n'existe pas"
      }
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_update_user = (async (user_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "/" + user_data.id
  try {
    let response = await axios.patch(urlcomplete, {
      phone: user_data.phone,
      firstname: user_data.firstname,
      lastname: user_data.lastname,
      email: user_data.email
    })
    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_update_user_password = (async (user_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "/" + user_data.id
  try {
    let response = await axios.patch(urlcomplete, {
      password: user_data.password
    })
    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_create_connection_history = (async (user_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_CONNECTION_HISTORY

  try {
    let response = await axios.post(urlcomplete, {
      user: user_data.id,
      login_at: moment().format("YYYY-MM-DD HH:mm:ss")
    })

    if (response.status == 200 || response.status == 201 || response.status == 204) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_verify_hash = (async (password, hash) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_TO_VERIFY_HASH
  try {
    let response = await axios.post(urlcomplete, {
      string: password,
      hash: hash
    })
    if (response.status == 200) {
      let rdata = response.data
      if (rdata.data) {
        result.success = true
      } else {
        error = "Le mot de passe est incorrect"
      }
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})


const directus_list_documents = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT + "?sort=-id&filter[status][_eq]=true"
  urlcomplete += "&fields[]=*,user.*"
  try {
    let response = await axios.get(urlcomplete)
    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_create_document = (async (document_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT
  try {
    let response = await axios.post(urlcomplete, document_data)
    if (response.status == 200 || response.status == 201 || response.status == 204) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_list_clients = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "?sort=-id&filter[profile][_eq]=" + USERPROFILE_TYPE_CLIENT
  try {
    let response = await axios.get(urlcomplete)
    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_create_client = (async (client_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER
  try {
    client_data.code = genUserCode()
    client_data.username = client_data.email
    client_data.password = "12341234"
    client_data.profile = USERPROFILE_TYPE_CLIENT
    client_data.status = true
    let response = await axios.post(urlcomplete, client_data)
    if (response.status == 200 || response.status == 201 || response.status == 204) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.response.data ? err.response.data.errors[0].message : err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})


module.exports = {
  control_service_data,
  generate_qr_code,
  add_qr_code_to_pdf,
  directus_retrieve_user,
  directus_update_user,
  directus_verify_hash,
  directus_create_connection_history,
  directus_update_user_password,
  directus_list_documents,
  directus_create_document,
  directus_list_clients,
  directus_create_client
}