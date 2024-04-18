const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticket_no: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true 
  }
},{
  timestamps: true 
});

const TicketModel = mongoose.model('ticket', ticketSchema);

module.exports = TicketModel;
