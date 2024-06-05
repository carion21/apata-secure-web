const axios = require('axios');
const { getDirectusUrl } = require('../../../config/utils');
const express = require('express');
const router = express.Router();
const urlapi = getDirectusUrl();

const getDocumentsOfFolder = async (req, res, next) => {
    const folderId = req.params.folderId;

    let result = {
        success: false,
        message: ""
    };

    const url = `${urlapi}/items/aps_document?filter[status][_eq]=true&filter[folder][_eq]=${folderId}&sort=-id&fields[]=*,user.*`;

    console.log(url);

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const documents = response.data.data;

            result.success = true;
            result.message = "Documents trouvés";
            result.documents = documents;
        } else {
            console.log(`Request failed with status: ${response.status}.`);
            result.message = `Request failed with status: ${response.status}.`;
        }
    } catch (error) {
        console.error(error.toString());
        result.message = error.toString();
    }

    res.json(result);
};

const getDocumentByCode = async (req, res, next) => {
    const documentCode = req.params.documentCode;

    let result = {
        success: false,
        message: ""
    };

    const url = `${urlapi}/items/aps_document?filter[status][_eq]=true&fields[]=*,user.*&filter[code][_eq]=${documentCode}`;

    console.log(url);

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const documents = response.data.data;

            if (documents.length === 1) {
                let document = documents[0];
                document.link = `https://apw.geasscorp.com/uploads/${document.output_path}`;
                result.success = true;
                result.message = "Document trouvé";
                result.document = document;
            } else {
                result.message = "Le document n'existe pas";
            }
        } else {
            console.log(`Request failed with status: ${response.status}.`);
            result.message = `Request failed with status: ${response.status}.`;
        }
    } catch (error) {
        console.error(error.toString());
        result.message = error.toString();
    }

    res.json(result);
};

const getDocumentsOfUser = async (req, res, next) => {
    const userId = req.params.userId;

    let result = {
        success: false,
        message: ""
    };

    const url = `${urlapi}/items/aps_document?filter[status][_eq]=true&filter[user][_eq]=${userId}&sort=-id&fields[]=*,user.*`;

    console.log(url);

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const documents = response.data.data;

            result.success = true;
            result.message = "Documents trouvés";
            result.documents = documents;
        } else {
            console.log(`Request failed with status: ${response.status}.`);
            result.message = `Request failed with status: ${response.status}.`;
        }
    } catch (error) {
        console.error(error.toString());
        result.message = error.toString();
    }

    res.json(result);
};

// const newDocument = async (req, res, next) => {




router.get('/code/:documentCode', getDocumentByCode);
router.get('/:folderId', getDocumentsOfFolder);
router.get('/user/:userId', getDocumentsOfUser);

module.exports = router;