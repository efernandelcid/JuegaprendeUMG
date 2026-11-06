const router = require('express').Router();
const { salud } = require('../controllers/saludController');

router.get('/salud', salud);

module.exports = router;
