const router = require('express').Router();
const Profile = require('../../models/Profile')
const passport = require('passport')
const validateProfileInput = require('../../validators/profile')
const validateExperienceInput = require('../../validators/experience')
const validateEducationInput = require('../../validators/education')
const User = require('../../models/User')

router.get('/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        let s = ''
        for(var name in req.headers){
            s += name + ':' + req.headers[name] +'\\n';
        }
        let errors = {}
        Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {

                if (!profile) {
                    errors.noprofile = "Profile not found"
                    return res.status(400).json(errors)
                }
                return res.json(profile)

            })
            .catch(err => console.log(err))
    }

)

router.get('/handle/:handle',
    (req, res) => {
        let errors = {}
        Profile.findOne({ handle: req.params.handle })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = "Handle not found"
                    return res.status(400).json(errors)
                }
                return res.json(profile)

            })
            .catch(err => console.log(err))
    }

)

router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err =>
            res.status(404).json({ profile: 'There is no profile for this user' })
        );
});

router.post('/experience',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateExperienceInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

        Profile.findOne({ user: req.user.id })
            .then(profile => {

                const experience = {
                    title: req.body.title,
                    company: req.body.company,
                    location: req.body.location,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    description: req.body.description
                }

               // Profile.experience.unshift(experience)
               profile.experience.unshift(experience);
               profile.save().then(profile => res.json(profile))

            })
    }
)

router.post(
    '/education',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateEducationInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

        Profile.findOne({ user: req.user.id }).then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };

            // Add to exp array
            profile.education.unshift(newEdu);

            profile.save().then(profile => res.json(profile));
        });
    }
);

router.delete('/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {

        Profile.findOne({ user: req.user.id })
            .then(profile => {

                let removeIndex = profile.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id)

                // Splice out of array
                profile.experience.splice(removeIndex, 1);

                // Save
                profile.save().then(profile => res.json(profile));
            })
            .catch(err => res.json(err))
    }



)

router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                // Get remove index
                const removeIndex = profile.education
                    .map(item => item.id)
                    .indexOf(req.params.edu_id);

                // Splice out of array
                profile.education.splice(removeIndex, 1);

                // Save
                profile.save().then(profile => res.json(profile));
            })
            .catch(err => res.status(404).json(err));
    }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOneAndRemove({ user: req.user.id }).then(() => {
            User.findOneAndRemove({ _id: req.user.id }).then(() =>
                res.json({ success: true })
            );
        });
    }
);


router.post('/', passport.authenticate('jwt', { session: false }),

    (req, res) => {

        let { errors, isValid } = validateProfileInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

        const profileFields = {}
        profileFields.user = req.user.id
        if (req.body.handle) profileFields.handle = req.body.handle
        if (req.body.company) profileFields.company = req.body.company
        if (req.body.website) profileFields.website = req.body.website
        if (req.body.location) profileFields.location = req.body.location
        if (req.body.status) profileFields.status = req.body.status
        if (req.body.bio) profileFields.bio = req.body.bio
        if (req.body.githubusername) profileFields.githubusername = req.body.githubusername
        //skills array
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        profileFields.social = {}

        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

        Profile.findOne({ user: req.user.id })
            .then(profile => {

                if (profile) {
                    //Update
                    Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
                        .then(profile => res.json(profile))
                }
                else {
                    //create 
                    Profile.findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if (profile) {
                                errors.handle = 'That handle already exists';
                                res.status(400).json(errors);
                            }
                            else {
                                new Profile(profileFields).save().then(profile => res.json(profile));
                            }
                        })
                }
            })
    }


)

module.exports = router;