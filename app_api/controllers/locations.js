
const mongoose = require('mongoose');
const Loc = mongoose.model('Location');
const request = require('request');
const apiOptions = {
  server: 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://pure-temple-67771.herokuapp.com';
}

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if(!isNaN(distance)) {
    if (distance > 1000) {
      thisDistance = parseFloat(distance / 1000).toFixed(1);
      unit = 'km';
    } else {
      thisDistance = Math.floor(distance);
    }
  } else {
    thisDistance = -999;
    unit = invalid
  }
  return thisDistance + unit;
}

const renderHomepage = (req, res, responseBody) => {
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: { 
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about.",
    locations: responseBody
  });
};

const homelist = (req, res) => {
  const path = '/api/locations';
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {},
    qs: {
      lng: -0.7992599,
      lat: 51.378091,
      maxDistance: 20
    }
  };
  request(
    requestOptions,
    (err, response, body) => {
      let data = [];
      data = body.map( (item) => {
        item.distance = formatDistance(item.distance);
        return item;
      });
      renderHomepage(req, res, data);
    }
  );
};


// const locationsCreate = (req, res) => { };

/* const locationsCreate = (req, res) => {
  console.log("api locations.js locationsCreate");
  res
    .status(200)
    .json({"status" : "success"});
} */

const locationsCreate = (req, res) => {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities:
      req.body.facilities.split(","),
    coords: {
      type: "Point"
      [
        parseFloat(req.body.lng),
        parseFloat(req.body.lat)
      ]
    },
    openingTimes:[ 
      {
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        close: req.body.closed1,
      },
      {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        close: req.body.closed2,
      }]
  }, (err, location) => {
    if (err) {
      res
        .status(400)
        .json(err)
    }
    else {
      res
        .status(201)
        .json(location);
    }
  });
};

const locationsReadOne = (req, res) => {
  Loc
    .findById(req.params.locationid)
    .exec((err, location) => {
      if(!location) {
        return res
          .status(404)
          .json({
            "message": "location not found"
          });
      }
      else if (err) {
        return res
          .status(404)
          .json(err);
      }
      res
        .status(200)
        .json(location)
    })
}

const reviewsReadOne = (req, res) => {
  Loc
    .findById(req.params.locationId)
    .select('name reviews')
    .exec((err, location) => {
      if(!location) {
        return res
          .status(404)
          .json({
            "message": "location not found"
          });
        } else if (err) {
          return res
            .status(400)
            .json(err);
        }
        if (location.reviews && location.reviews.length > 0) {
          const review = location.reviews.id(req.params.reviewid);
          if(!review) {
            return res
              .status(400)
              .json({
                "message": "review not found"
              });
          
          } else {
            response = {
              location : { 
                name : location.name,
                id : req.params.locationid
              },
              review
            };
            return res
              .status(200)
              .json(response);
          }
        } else {
            return res
              .status(404)
              .json({
                "message": "No reviews found"
              });
        }
    }
  );
};

const locationsListByDistance = async(req, res) => {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const near = {
    type: "Point",
    coordinates: [lng, lat]
  };
  const geoOptions = {
    distancefield: "distance.calculated",
    key: 'coords',
    spherical: true,
    maxDistance: 20000,
    limit: 10
  };
  if (!lng || !lat) {
    return res
      .status(404)
      .json({
        "message": "lng and lat query parameters are required"
      });  
  }
  try {
    const results = await Loc.aggregate([
      {
        $geoNear: {
          near, 
          ...geoOptions
        }
      }
    ]);
    const locations = results.map(result => {
      return {
        id: result._id,
        name: result.name,
        address: result.address,
        rating: result.rating,
        facilities: result.facilities,
        distance: `${result.distance.calculated.toFixed()}`
      }
    });
    res 
      .status(200)
      .json(locations);
  
  } catch (err) {
    res
      .status(404)
      .json(err);
  }
}

const locationsUpdateOne = (req, res) => {
  if(!req.params.locationid) {
    return res
      .status(404)
      .json({
        "message": "Not found, locationid is required"
      });
  }
  Loc
    .findById(req.params.locationid)
    .select('-reveiws -rating')
    .exec((err, location) => {
      if(!location) {
        return res
          .json(404)
          .status({
            "message": "locationid not found"
          });
      } else if (err) {
        return res
          .status(400)
          .json(err);
      }
      location.name = req.body.name;
      location.address = req.body.address;
      location.facilities = req.body.facilities.split(',');
      location.coords = {
        type: "Point"
        [
          parseFloat(req.body.lng),
          parseFloat(req.body.lat)
        ]
      };
      location.openingTimes = [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1,
      }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2
      
      }];
      location.save((err, loc) => {
        if (err) {
          res
            .status(404)
            .json(err);
        } else {
          res
            .status(200)
            .json(doc);
        }
      });
    }
  );
}

const locationsDeleteOne = (req, res) => {
  const {locationid} = req.params;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid)
      .exec((err, location) => {
        if (err) {
          return res
            .status(404)
            .json(err);
        }
        res
          .status(204)
          .json(null);
      }
      );
  } else {
    res
      .status(404)
      .json({
        "message": "No Location"
      });
  }
};

module.exports = {
  locationsListByDistance,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne, 
  locationsDeleteOne 
}