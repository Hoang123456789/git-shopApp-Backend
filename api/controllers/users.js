const User = require('../models/user');
const PasswordReset = require('../models/password_reset');

const mongoose = require('mongoose');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = require('../../config');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		    user: config.nodemailer.user,
		    pass: config.nodemailer.pass
	  }
});

exports.users_signup = (req, res, next) => {

  // chack if email already registered
  User.find({email: req.body.email})
  .exec()
  .then(user => {

    if(user.length >= 1) {

      return res.status(409).json({
        message: 'User already registered with this email ID'
      });

    } else {

        const userPassword = req.body.password;
        const hashPassword = crypto.createHmac('sha256', userPassword)
                         .update('I love cupcakes')
                         .digest('hex');

        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hashPassword
        });

        user.save()
        .then(result => {

          const response = {
            message: 'User Created',
            user: {
              _id: result._id,
              email: result.email
            }
          };

          return res.status(201).json(response);

        })
        .catch(err => {
          return res.status(500).json({
            error: err
          });
        });
    }
  });


}

exports.users_login = (req, res, next) => {

  User.find({ email: req.body.email })
  .exec()
  .then(user => {
    if(user.length < 1) {
      return res.status(401).json({
        message: 'Auth failed'
      });
    } else {

      const givenPassword = req.body.password;
      const hashPassword = crypto.createHmac('sha256', givenPassword)
                       .update('I love cupcakes')
                       .digest('hex');
      const storedPassword = user[0].password;

      if(hashPassword === storedPassword){

        let secret;
        if(req.body.email === 'admin@shopapp.com'){
          secret = 'admin!23'
        } else {
          secret = 'skonsSp19'
        }

        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id
          },
          secret,
          {
            expiresIn: "1h"
          }
        );

        return res.status(200).json({
          message: 'Auth success',
          token: token
        });

      } else {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }

    }

  })
  .catch( err => {
    return res.status(500).json({
      error : err
    });
  });

}

exports.users_get_all = (req, res, next) => {

  User.find()
  .select('_id email')
  .exec()
  .then(users => {

    const response = {
      count: users.length,
      users: users.map(user => {
        return {
          _id: user._id,
          email: user.email
        }
      })
    };

    if(users.length > 0){
      return res.status(200).json(response);
    } else {
      return res.status(200).json({
        message: '0 user found. create new user using signup'
      });
    }

  })
  .catch( err => {
    return res.status(500).json({
      error: err
    });
  });

}

exports.users_delete_user = (req, res, next) => {

  User.remove({_id: req.params.userId})
  .exec()
  .then( result => {
    console.log(result);
    return res.status(200).json({
      message: 'User Deleted',
      deleted_user_id: req.params.userId
    });
  })
  .catch( err => {
    return res.status(500).json({
      error: err
    });
  });

}

exports.users_forgot_password = (req, res, next) => {
  // check if email exists
  // if no, return error
  User.find({ email: req.body.email })
  .exec()
  .then( user => {
    if(user.length < 1) {
      return res.status(404).json({
        message: 'User not registered'
      });
    } else {

      // if yes, create a JWT for password reset and store in db
      const resetJWTToken = jwt.sign(
        {
          email: user[0].email,
          userId: user[0]._id,
          time: Date.now()
        },
        'F0rG0tPWD!2345',
        {
          expiresIn: "1h"
        }
      );

			const hashedToken = crypto.createHmac('sha256', resetJWTToken)
											 .update('I love cupcakes')
											 .digest('hex');

      // send email with reset password link
      let msg = '<p>We received a request to reset your password. Click <a href="http://localhost:8000/users/change_password/' + hashedToken + '">here</a> to reset your password</p><br>Above link is valid only for next 1 hour.'

      let mailOptions = {
        from: config.nodemailer.user,
        to: user[0].email,
        subject: 'Reset Your Password',
        html: msg
      };

      transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
      	   console.log(error);
        } else {
          // checking db for password reset, update previous entry or create new entry

      	   console.log('Email sent: ' + info.response);
           PasswordReset.find({email: user[0].email})
           .exec()
           .then(entry => {

             if(entry.length >= 1) {
               // update the token data - when user request again for password reset, update with new token
							 const update = {
								 token: resetJWTToken,
								 hashedToken: hashedToken
							 };
               PasswordReset.update({ email: user[0].email }, { $set: update })
               .exec()
               .then( result => {
                 return res.status(200).json({
                   message : "An email has been sent to "+user[0].email+" with password reset link"
                 });
               })
               .catch( err => {
                 return res.status(500).json({
                   error : err
                 });
               });

             } else {
               // create new entry

                 const passwordReset = new PasswordReset({
                   _id: new mongoose.Types.ObjectId(),
                   email: user[0].email,
                   token: resetJWTToken,
									 hashedToken: hashedToken
                 });

                 passwordReset.save()
                 .then(result => {

                   return res.status(200).json({
                     message : "An email has been sent to "+user[0].email+" with password reset link"
                   });

                 })
                 .catch(err => {
                   return res.status(500).json({
                     error: err
                   });
                 });
             }
           });

        }
      });

    }
  })
  .catch( err => {
    return res.status(500).json({
      error: err
    })
  });

};

exports.users_change_password = (req, res, next) => {

	const hashed_token = req.params.hashedToken;

	// check the existence of token
	PasswordReset.find({hashedToken: hashed_token})
	.exec()
	.then(entry => {

		if(entry.length >= 1) {
			// entry exists, password is not changed yet
			// chacking validity of Token
			try{
				const token = entry[0].token;
				const decodedToken = jwt.verify(token, 'F0rG0tPWD!2345');
				// token verified, go and update the password by hashing it.
				const newPassword = req.body.password;
				if(!newPassword){
					return res.status(404).json({
						message : 'New password is required'
					});
				} else {
					const newHashedPassword = crypto.createHmac('sha256', newPassword)
	                         .update('I love cupcakes')
	                         .digest('hex');
					User.update({ email: entry[0].email }, { $set: {password: newHashedPassword} })
					.exec()
					.then( result => {
						// password updated, remove entry from db
						PasswordReset.remove({_id: entry[0]._id})
					  .exec()
					  .then(result => {
							return res.status(200).json({
								message : "Password Changed"
							});
					  })
					  .catch(err => {
					    return res.status(500).json({
					      error: err
					    });
					  });

					})
					.catch( err => {
						return res.status(500).json({
							error : err
						});
					});
				}

		  } catch(error) {
				// token expired, remove entry from db and give error as response
				PasswordReset.remove({_id: entry[0]._id})
			  .exec()
			  .then(result => {
					return res.status(401).json({
			      message: 'Token Expired. Use Forget Password to receive password reset link again.'
			    });
			  })
			  .catch(err => {
			    return res.status(500).json({
			      error: err
			    });
			  });

		  }

		} else {
			// no entry, give error - passowrd already changed
			return res.status(404).json({
				Message: 'No request was made to reset the password.'
			});
		}

	})
	.catch( err => {
		return res.status(500).json({
			error: err
		});
	});
};
