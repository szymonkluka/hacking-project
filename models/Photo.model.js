const mongoose = require('mongoose');
const Voter = require('./voter.model'); // Import the Voter model

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  email: { type: String, required: true },
  src: { type: String, required: true },
  votes: { type: Number, required: true },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voter' }], // Add the voters field
});

module.exports = mongoose.model('Photo', photoSchema);