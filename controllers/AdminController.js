const express = require('express');
const router = express.Router();

const service = 'admin'

// routers
const index = require('../routes/' + service + '/index')

const client_list = require('../routes/' + service + '/client_management/client_list')
const new_client = require('../routes/' + service + '/client_management/new_client')
const view_client = require('../routes/' + service + '/client_management/view_client')

const intermed_list = require('../routes/' + service + '/intermed_management/intermed_list')
const new_intermed = require('../routes/' + service + '/intermed_management/new_intermed')
const view_intermed = require('../routes/' + service + '/intermed_management/view_intermed')

const agent_list = require('../routes/' + service + '/agent_management/agent_list')
const new_agent = require('../routes/' + service + '/agent_management/new_agent')
const view_agent = require('../routes/' + service + '/agent_management/view_agent')

const document_list = require('../routes/' + service + '/document_management/document_list')
const new_document = require('../routes/' + service + '/document_management/new_document')
const view_document = require('../routes/' + service + '/document_management/view_document')
const auth_document = require('../routes/' + service + '/document_management/auth_document')

const security = require('../routes/' + service + '/user_management/security')
const account_details = require('../routes/' + service + '/user_management/account_details')



// routes with each router
router.use('/', index)

router.use('/client_management/client_list', client_list)
router.use('/client_management/new_client', new_client)
router.use('/client_management/view_client', view_client)

router.use('/intermed_management/intermed_list', intermed_list)
router.use('/intermed_management/new_intermed', new_intermed)
router.use('/intermed_management/view_intermed', view_intermed)

router.use('/agent_management/agent_list', agent_list)
router.use('/agent_management/new_agent', new_agent)
router.use('/agent_management/view_agent', view_agent)

router.use('/document_management/document_list', document_list)
router.use('/document_management/new_document', new_document)
router.use('/document_management/view_document', view_document)
router.use('/document_management/auth_document', auth_document)

router.use('/user_management/security', security)
router.use('/user_management/account_details', account_details)




module.exports = router;