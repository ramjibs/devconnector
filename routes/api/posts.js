const router = require('express').Router();

router.get('/test', (req, res) => {
    res.json("its works")
})

module.exports = router;