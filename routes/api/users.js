const router = require('express').Router();
const User = require('../../models/User').User
const gravatar = require('gravatar')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretKey = require('../../config/keys').SecretKey;
const passport = require('passport');
const validateLoginInput = require('../../validators/login')
const validateRegisterInput = require('../../validators/register')

router.post('/register', (req, res) => {

    const { errors, isValid } = validateRegisterInput(req.body);

    //         // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
    User.findOne({ email: req.body.email })
        .then(user => { 
            

            if (user) {
                errors.email = 'Email id already exist'
                return res.status(404).json(errors)
            }
            else {
                const avatar = gravatar.url(req.body.email, {
                    's': '200', //size
                    'r': 'pg', //ratings
                    'd': 'mm' //default

                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                }) 




                bcryptjs.genSalt(10, (err, salt) => {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })

            }
        })
})

router.post('/login', (req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;

     const { errors, isValid } = validateLoginInput(req.body);

    //         // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }

    User.findOne({ email })
        .then(user => {

            if (!user) {
                errors.email = "User not found"
                console.log(user)
                return res.status(404).json(errors);
                
            }
            bcryptjs.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = { _id: user._id, name: user.name, email: user.email };
                        
                        jwt.sign(payload, secretKey, { expiresIn: 3600 }, (err, token) => {
                            return res.json({
                                msg: "Success",
                                token: 'Bearer ' + token
                            })
                        })

                    }
                    else {
                        errors.password = "incorrect password"
                        return res.status(400).json(errors);
                    }

                })
        })
})

router.post('/current', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        return res.json({
            email: req.user.email
        })
    }
)

router.post('/current11', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        return res.json({
            email: req.user.email
        })
    }
)

module.exports = router;