const express = require('express');
const axios = require('axios');

const { getMoment, getTabSideBase, getRouteDeBase, getDirectusUrl, isInteger, genUserCode } = require('../../../config/utils');
const { DEFAULT_PROFILE_ADMIN, APP_NAME, APP_VERSION, APP_DESCRIPTION, NLIMIT } = require('../../../config/consts');
const { activeSidebare, getIndice } = require('../../../config/sidebare');
const {directus_create_client} = require('../../../config/global_functions');
const router = express.Router();

const urlapi = getDirectusUrl();
const moment = getMoment();

const SERVICE_TYPE = "admin_new_client"

const profile = DEFAULT_PROFILE_ADMIN;


router.post('/', async function (req, res, next) {
    let body = req.body
    // let bcontrol = control_service_data(SERVICE_TYPE, body)

    let error = ""
    console.log(body)
    console.log("sds",directus_create_client );
    let r_dts_new_client = await directus_create_client({
        lastname: body.lastname,
        firstname: body.firstname,
        email: body.email,
        phone: body.phone,
        password: body.password,
    })

    if (r_dts_new_client.success) {
        res.status(200).json(r_dts_new_client.data)
    } else {
        res.status(400).json({ message: r_dts_new_client.message })
    }

});
module.exports = router;