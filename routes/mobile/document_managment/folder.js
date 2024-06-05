const express = require('express');
const { getDirectusUrl } = require('../../../config/utils');
const router = express.Router();
const axios = require('axios');
const shortid = require('shortid');
const urlapi = getDirectusUrl();

const getFolders = async (req, res, next) => {
    const userId = req.params.userId;

    let result = {
        success: false,
        message: ""
    };

    const url = `http://167.86.106.97/items/aps_folder?filter[status][_eq]=true&filter[owner][_eq]=${userId}&sort=-id&fields[]=*,project.*,owner.*`;

    console.log(url);

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const documents = response.data.data;

            result.success = true;
            result.message = "Documents trouvés";
            result.folders = documents;
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

const newFolder = async (req, res, next) => {
    const { name, userId, projectId } = req.body;

    let result = {
        success: false,
        message: ""
    };

    const url = `${urlapi}/items/aps_folder`;

    try {
        const createdAt = new Date().toISOString();
        const shortCode = shortid.generate().toUpperCase();

        // get the 2nd to 5th characters of the created_at
        let fcode = createdAt.substring(2, 10).replace(/-/g, '');
        fcode = `${fcode}${createdAt.substring(11, 13)}_${createdAt.substring(14, 19).replace(/:/g, '')}_`;

        // plus 4 random digits
        const randomnum = Math.floor(Math.random() * 10000);
        fcode = `FOD${fcode}${randomnum.toString().padStart(4, '0')}`;

        console.log('fcode:', fcode);

        const response = await axios.post(url, {
            name,
            owner: userId,
            project: projectId,
            code: fcode,
            short_code: shortCode,
            created_at: createdAt,
        }, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            }
        });
        // res.status(200).json("data", response);
        console.log("res",response);
        if (response.status === 200 ) {
            result.success = true;   
            result.message = "Dossier créé";
            // res.status(200).json(result);
        
        } else {
            result.message = response.data.message || `Request failed with status: ${response.status}`;
        }
    } catch (error) {
        console.error(error.toString());
        result.message = error.toString();
        // res.status(400).json(error);
    }

    res.json(result);
};

router.get('/:userId', getFolders);
router.post('/new', newFolder);


module.exports = router;