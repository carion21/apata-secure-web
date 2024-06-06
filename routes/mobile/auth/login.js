const express = require('express');
const axios = require('axios');
const { control_service_data, directus_retrieve_user, directus_verify_hash, directus_create_connection_history } = require('../../../config/global_functions');

const router = express.Router();


router.post('/', async function (req, res, next) {
    let body = req.body
    
    let user =  await directus_retrieve_user(body.email)

    try{
        if (user.success) {
            let user_data = user.data
            let verify = await directus_verify_hash(body.password, user_data.password)
            if (verify.success) {
               res.status(200).json(user_data)
            } else {
                res.status(400).json({message: verify.message})
            }
        }else{
            res.status(400).json({message: user.message})
        }

    } catch (error) {
        res.status(500).json({message: error.message})
    }
});  


router.get('/', async function (req, res, next) {
    res.redirect('/security/login')
});

module.exports = router;