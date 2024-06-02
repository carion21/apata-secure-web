const express = require('express');
const router = express.Router();

const service = 'mobile'

// routers
const index = require('../routes/' + service + '/index')
const login = require('../routes/' + service + '/auth/login')  
const register = require('../routes/' + service + '/auth/register')
const lists_projects = require('../routes/' + service + '/document_managment/lists_projects')
const folder = require('../routes/' + service + '/document_managment/folder'); 
const document = require('../routes/' + service + '/document_managment/document');

// routes with each router

router.use('/', index)
router.use('/login', login)
router.use('/register', register)
router.use('/lists_projects', lists_projects)
router.use('/folder', folder); 
router.use('/document', document);
// router.use('/auth', auth)


module.exports = router;