
const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

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
        distance: `${result.distance.calculated.toFixed()}m`
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