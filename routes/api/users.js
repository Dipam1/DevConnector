const express = require('express');
const router = express.Router();
const gravitar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');
const User = require('../../models/User');


//@route    POST api/users
//@desc     Register User
//@access   Public

router.post('/', [
    check('name', "Name is required").not().isEmpty(),
    check('email', "Email is required").isEmail(),
    check('password', "6 or more Characters").isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        name,
        email,
        password
    } = req.body;

    try {
        //see if the user exists
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'user already exists'
                }]
            });
        }
        //for avatar
        const avatar = gravitar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });
        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;
            res.json({
                token
            })
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

module.exports = router;