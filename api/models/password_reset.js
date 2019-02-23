const mongoose = require('mongoose');

const passwordResetSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required : true
  },
  hashedToken: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
