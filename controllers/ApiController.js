const express = require('express');
const router = express.Router();

const service = 'api'

// routers
const index = require('../routes/' + service + '/index')

const new_document = require('../routes/' + service + '/v1/new_document')

// routes with each router
router.use('/', index)

router.use('/v1/new_document', new_document)


module.exports = router;