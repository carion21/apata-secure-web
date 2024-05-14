const express = require('express');
const router = express.Router();

const service = 'intermed'

// routers
const index = require('../routes/' + service + '/index')

const folder_list = require('../routes/' + service + '/folder_management/folder_list')
const search_folder = require('../routes/' + service + '/folder_management/search_folder')
const join_folder = require('../routes/' + service + '/folder_management/join_folder')
const edit_folder = require('../routes/' + service + '/folder_management/edit_folder')
const view_folder = require('../routes/' + service + '/folder_management/view_folder')

const document_list = require('../routes/' + service + '/document_management/document_list')
const new_document = require('../routes/' + service + '/document_management/new_document')
const view_document = require('../routes/' + service + '/document_management/view_document')
// const auth_document = require('../routes/' + service + '/document_management/auth_document')

const security = require('../routes/' + service + '/user_management/security')
const account_details = require('../routes/' + service + '/user_management/account_details')



// routes with each router
router.use('/', index)

router.use('/folder_management/folder_list', folder_list)
router.use('/folder_management/search_folder', search_folder)
router.use('/folder_management/join_folder', join_folder)
router.use('/folder_management/edit_folder', edit_folder)
router.use('/folder_management/view_folder', view_folder)

router.use('/document_management/document_list', document_list)
router.use('/document_management/new_document', new_document)
router.use('/document_management/view_document', view_document)
// router.use('/document_management/auth_document', auth_document)

router.use('/user_management/security', security)
router.use('/user_management/account_details', account_details)




module.exports = router;