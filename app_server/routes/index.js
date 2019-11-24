const express = require('express');
const  router = express.Router();
const ctrlLocations = require('../controllers/location');
const ctrlOthers = require('../controllers/others');

const app = express();
const bodyParser = require('body-parser');

// Boyd Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


/* Locations pages */
router.get('/', ctrlLocations.homelist);
// router.get('/location', ctrlLocations.locationInfo);
router.get('/location/:locationid', ctrlLocations.locationInfo);
router.get('/location/review/new', ctrlLocations.addReview);

/* Other pages */
router.get('/about', ctrlOthers.about); 

module.exports = router;