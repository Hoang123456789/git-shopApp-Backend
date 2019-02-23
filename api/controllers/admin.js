const PasswordReset = require('../models/password_reset');
const mongoose = require('mongoose');

exports.admin_get_passwordTable = (req, res, next) => {
  PasswordReset.find()
  .exec()
  .then( docs => {

    const response = {
      count: docs.length,
      Entries: docs.map(doc => {
        return {
          _id: doc._id,
          email: doc.email,
          token: doc.token,
          hashedToken: doc.hashedToken
        }
      })
    };

    if(docs.length > 0){
      return res.status(200).json(response);
    } else {
      return res.status(200).json({
        message : '0 Entries Found.'
      });
    }

  })
  .catch( err => {
    return res.status(500).json({
      error: err
    });
  });
};

exports.admin_delete_passwordTable = (req, res, next) => {
  PasswordReset.remove({_id: req.params.id})
  .exec()
  .then(result => {
    return res.status(200).json({
      message: 'Entry Deleted'
    });
  })
  .catch(err => {
    return res.status(500).json({
      error: err
    });
  });
};
