const {APP_SERVER_FICHIER_APP_UID,APP_SERVER_FICHIER_LOGIN_PASSWORD, APP_SERVER_FICHIER_LOGIN_USERNAME, APP_SERVER_FICHIER_ROUTE_LOGIN,APP_SERVER_FICHIER_ROUTE_UPLOAD,APP_SERVER_FICHIER_URL, SERVICE_TYPES_FIELDS, ROUTE_OF_DIRECTUS_FOR_USER, ROUTE_OF_DIRECTUS_FOR_CONNECTION_HISTORY, ROUTE_OF_DIRECTUS_TO_VERIFY_HASH, USERPROFILE_TYPE_CLIENT, ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT, QRGENERATOR_URL, ROUTE_OF_QRGENERATOR_TO_GENERATE, USERPROFILE_TYPE_INTERMED, ROUTE_OF_DIRECTUS_FOR_APS_PROFILE, ROUTE_OF_DIRECTUS_FOR_APS_PROJECT, ROUTE_OF_DIRECTUS_FOR_APS_FOLDER_ACTOR, ROUTE_OF_DIRECTUS_FOR_APS_FOLDER, USERPROFILE_TYPE_AGENT, ROUTE_OF_DIRECTUS_FOR_TOWN_HALL, ROUTE_OF_DIRECTUS_FOR_TOWN_HALL_DOCUMENT_TYPE, APP_SERVER_FICHIER_ROUTE_DOWNLOAD_BY_CODE, } = require("./consts")
const { isString, isInteger, isBoolean, isObject, isArray, isNumber, isArrayOfString, isArrayOfInteger, getMoment, getDirectusUrl, genUserCode } = require("./utils")
const FormData = require('form-data');
const axios = require('axios');
const validator = require('email-validator');

const { PDFDocument, rgb } = require('pdf-lib');
const { degrees } = require('pdf-lib').degrees;
const { Image } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const qr = require('qr-image');
const { token } = require("morgan");
// const { head } = require("../routes/mobile/auth/register");

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
    console.log(response.data);
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

const convertImageToPdf = (async (imagePath, pdfPath) => {
  // Read the image file asynchronously.
  const image = await fs.promises.readFile(imagePath);

  // Create a new PDF document.
  const pdfDoc = await PDFDocument.create();

  // Embed the image into the PDF document.
  const imageEmbed = await pdfDoc.embedJpg(image);

  const page = pdfDoc.addPage([imageEmbed.width, imageEmbed.height]);

  // Scale the image to fit within the page dimensions while preserving aspect ratio.
  const { width, height } = imageEmbed.scaleToFit(
    page.getWidth(),
    page.getHeight()
  );

  // Draw the image on the PDF page.
  page.drawImage(imageEmbed, {
    x: page.getWidth() / 2 - width / 2, // Center the image horizontally.
    y: page.getHeight() / 2 - height / 2, // Center the image vertically.
    width,
    height,
    color: rgb(0, 0, 0), // Set the image color to black.
  });

  // Save the PDF document as bytes.
  const pdfBytes = await pdfDoc.save();

  // Write the PDF bytes to a file asynchronously.
  await fs.promises.writeFile(pdfPath, pdfBytes);
  // remove the image file
  await fs.promises.unlink(imagePath);
});

const add_qr_code_to_pdf = (async (pdfPath, qrCodeBuffer, qrCodeText, outputPath) => {
  // Charger le PDF
  
})

const upload_file_to_server = async (file) => {
  let result = {
    success: false,
    message: ""
  };

  const urlComplete = APP_SERVER_FICHIER_URL + APP_SERVER_FICHIER_ROUTE_UPLOAD;
  const urlLogin = APP_SERVER_FICHIER_URL + APP_SERVER_FICHIER_ROUTE_LOGIN;

  const formData = new FormData();
  formData.append('file', file.buffer, { filename: file.originalname, contentType: 'application/pdf' });
  formData.append('applicationUuid', APP_SERVER_FICHIER_APP_UID);
  formData.append('name', file.originalname);
  formData.append('description', "document");

  try {
    const responseLogin = await axios.post(urlLogin, {
      username: APP_SERVER_FICHIER_LOGIN_USERNAME,
      password: APP_SERVER_FICHIER_LOGIN_PASSWORD
    });

    if (responseLogin.status === 201) {
      const token = responseLogin.data.data.jwt;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders() // Assurez-vous que formData est une instance du module 'form-data'
        }
      };

      try {
        const response = await axios.post(urlComplete, formData, config);
        if (response.status === 201) {
          result.success = true;
          result.data = response.data.data;
        } else {
          result.message = response.data.message;
        }
      } catch (error) {
        console.error("Error during file upload:", error);
        result.message = error.message;
      }
    } else {
      result.message = responseLogin.data.message;
    }
  } catch (err) {
    console.error("Error during login:", err);
    result.message = err.message;
  }

  return result;
};





const directus_retrieve_user = (async (username) => {
  let result = {
    success: false
  }
  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "?filter[username][_eq]=" + username
  urlcomplete += "&fields[]=*,aps_town_all.*,aps_profile.*"
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


const directus_list_documents = async (filters) => {
  let result = {
    success: false,
    data: []
  };

  let error = "";
  const urlLogin = APP_SERVER_FICHIER_URL + APP_SERVER_FICHIER_ROUTE_LOGIN;
  const urlgetDocFromAppServerByCode = APP_SERVER_FICHIER_URL + APP_SERVER_FICHIER_ROUTE_DOWNLOAD_BY_CODE;
  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT + "?sort=-id&filter[status][_eq]=true";
  if (filters.user) {
    urlcomplete += "&filter[user][_eq]=" + filters.user;
  }

  try {
    const responseLogin = await axios.post(urlLogin, {
      username: APP_SERVER_FICHIER_LOGIN_USERNAME,
      password: APP_SERVER_FICHIER_LOGIN_PASSWORD
    });

    if (responseLogin.status === 201) {
      const token = responseLogin.data.data.jwt;
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get(urlcomplete);
      if (response.status === 200) {
        let documents = response.data.data;
        console.log("documents.length", documents.length);
        
        for (let i = 0; i < documents.length; i++) {
          let doc = documents[i];
          let code = doc.code;
          let url = urlgetDocFromAppServerByCode + code;
          console.log("url", url);

          try {
            let responseDoc = await axios.get(url, config);
            if (responseDoc.status === 200) {
              documents[i].input_path = responseDoc.data.data.baseObjectUrl;
              documents[i].output_path = responseDoc.data.data.secureObjectUrl;
            }
          } catch (err) {
            console.log("error retrieving document path for", code, ":", err.message);
          }
        }

        result.success = true;
        result.data = documents;
        console.log("documents", result.data);
      } else {
        error = response.data.message;
      }
    } else {
      error = "Failed to login or obtain token.";
    }
  } catch (err) {
    error = err.message || "An error occurred during the API call.";
  }

  if (error !== "") {
    result.message = error;
  }

  return result;
}


const directus_list_documents_by_folder = (async (folder_id) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT + "?sort=-id&filter[folder][_eq]=" + folder_id
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

const directus_retrieve_document = (async (document_code) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT + "?limit=1&filter[code][_eq]=" + document_code
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

const directus_list_profiles = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_PROFILE + "?sort=-id"
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

const directus_list_projects = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_PROJECT + "?sort=-id"
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


const directus_list_intermeds = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "?sort=-id&fields[]=*,aps_profile.*,aps_project.*&filter[profile][_eq]=" + USERPROFILE_TYPE_INTERMED
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

const directus_create_intermed = (async (intermed_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER
  try {
    intermed_data.code = genUserCode()
    intermed_data.username = intermed_data.email
    intermed_data.password = "12341234"
    intermed_data.profile = USERPROFILE_TYPE_INTERMED
    intermed_data.status = true
    let response = await axios.post(urlcomplete, intermed_data)
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

async function directus_create_client(client_data) {
  let result = {
    success: false
  };
  let error = "";
  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER;

  try {
    client_data.code = genUserCode();
    client_data.username = client_data.email; // Assurez-vous que `genUserCode` est défini
    client_data.password = client_data.password;
    client_data.profile = USERPROFILE_TYPE_CLIENT;
    client_data.status = true;
    let response = await axios.post(urlcomplete, client_data);

    if (response.status === 200 || response.status === 201 || response.status === 204) {
      result.success = true;
      result.data = response.data.data;
    } else {
      error = response.data.message;
    }
  } catch (err) {
    error = err.response && err.response.data ? err.response.data.errors[0].message : err.message;
  }

  if (error !== "") {
    result.message = error;
  }

  return result;
}

const directus_list_agents = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER + "?sort=-id&filter[profile][_eq]=" + USERPROFILE_TYPE_AGENT
  urlcomplete += "&fields[]=*,aps_town_hall.*"
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

const directus_create_agent = (async (agent_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_USER
  try {
    agent_data.code = genUserCode()
    agent_data.username = agent_data.email
    agent_data.password = "12341234"
    agent_data.profile = USERPROFILE_TYPE_AGENT
    agent_data.status = true
    agent_data.aps_town_hall = agent_data.town_hall
    let response = await axios.post(urlcomplete, agent_data)
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

const directus_retrieve_folder = (async (folder_id) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER + "?limit=1&filter[id][_eq]=" + folder_id
  urlcomplete += "&fields[]=*,project.*,owner.*"
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

const directus_list_folders = (async (filters) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER + "?sort=-id"
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


const directus_list_intermed_folders = (async (filters) => {
  let result = {
    success: false
  }
  console.log(filters);

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER_ACTOR + "?sort=-id"

  if (filters.actor) {
    urlcomplete += "&filter[actor][_eq]=" + filters.actor
  }
  try {
    let response = await axios.get(urlcomplete)
    if (response.status == 200) {
      let rdata = response.data

      console.log(rdata);

      let folders = []
      const folder_ids = rdata.data.map(folder_actor => folder_actor.folder)
      urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER + "?sort=-id&filter[id][_in]=" + folder_ids.join(",")
      urlcomplete += "&fields[]=*,project.*,owner.*"
      let response_folders = await axios.get(urlcomplete)
      if (response_folders.status == 200) {
        let rdata_folders = response_folders.data
        folders = rdata_folders.data

        result.success = true
        result.data = rdata.data.map(folder_actor => {
          let folder = folders.find(f => f.id == folder_actor.folder)
          return folder
        })
      } else {
        error = response_folders.data.message
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

const directus_search_folder = (async (folder_code) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER + "?limit=1&filter[short_code][_contains]=" + folder_code
  urlcomplete += "&fields[]=*,project.*,owner.*"
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

const directus_create_folder_actor = (async (folder_actor_data) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER_ACTOR
  try {
    let response = await axios.post(urlcomplete, folder_actor_data)
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

const directus_filter_folder_actor = (async (actor, folder_ids) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_APS_FOLDER_ACTOR + "?sort=-id&filter[folder][_in]=" + folder_ids.join(",")
  urlcomplete += "&filter[actor][_eq]=" + actor
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

const directus_list_town_hall = (async () => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_TOWN_HALL + "?sort=-id&filter[status][_eq]=true"
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
    console.log(err);
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_list_town_hall_document_types = (async () => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_TOWN_HALL_DOCUMENT_TYPE + "?sort=id&filter[status][_eq]=true"
  try {
    let response = await axios.get(urlcomplete)
    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      // result.data = rdata.data.map(town_hall => town_hall.document_types)
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    console.log(err);
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const directus_retrieve_town_hall_document_type = (async (document_type_id) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + ROUTE_OF_DIRECTUS_FOR_TOWN_HALL_DOCUMENT_TYPE + "?limit=1&filter[id][_eq]=" + document_type_id
  try {
    let response = await axios.get(urlcomplete)
    if (response.status == 200) {
      let rdata = response.data
      if (rdata.data.length == 1) {
        result.success = true
        result.data = rdata.data[0]
      } else {
        error = "Le type de document n'existe pas"
      }
    } else {
      error = response.data.message
    }
  } catch (err) {
    console.log(err);
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})

module.exports = {
  control_service_data,
  convertImageToPdf,
  generate_qr_code,
  add_qr_code_to_pdf,
  directus_retrieve_user,
  directus_update_user,
  directus_verify_hash,
  directus_create_connection_history,
  directus_update_user_password,
  directus_list_documents,
  directus_list_documents_by_folder,
  directus_retrieve_document,
  directus_create_document,
  directus_list_projects,
  directus_list_profiles,
  directus_list_intermeds,
  directus_create_intermed,
  directus_list_clients,
  directus_create_client,
  directus_list_agents,
  directus_create_agent,
  directus_retrieve_folder,
  directus_list_folders,
  directus_list_intermed_folders,
  directus_search_folder,
  directus_create_folder_actor,
  directus_filter_folder_actor,
  directus_list_town_hall,
  directus_list_town_hall_document_types,
  directus_retrieve_town_hall_document_type,
  upload_file_to_server
}