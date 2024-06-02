const express = require('express');
const moment = require('moment');
const { directus_retrieve_user, directus_create_intermed, control_service_data, directus_list_projects, directus_list_profiles } = require('../../../config/global_functions');
const router = express.Router();



router.get('/', async function (req, res, next) {

    const r_dts_projects = await directus_list_projects({})
    const projects = r_dts_projects.data
    const r_dts_profiles = await directus_list_profiles({})
    const profiles = r_dts_profiles.data
  
   res.status(200).json({projects, profiles});
  });

  module.exports = router;