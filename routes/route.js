const express = require('express')
const router = express.Router()
const ticketController = require('../controllers/ticket.controller')

router.get('/csv-data', ticketController.getCsvData)
router.get('/tickets',ticketController.tickets)


module.exports = router