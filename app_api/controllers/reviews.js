const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

const reviewsCreate = (req, res) => {
  const locationId = req.params.locationid;
  // console.log('DEBUG: app_api **** req: ' + JSON.stringify(req));
  console.log('DEBUG: app_api **** reviewsCreate(): ' + locationId);

  if (locationId) {
    Loc
      .findById(locationId)
      .select('reviews')
      .exec((err, location) => {
        if (err) {
          console.log('DEBUG: err reviewsCreate()');
          res
            .status(400)
            .json(err)
        } else {
          console.log('DEBUG: reviewsCreate() doAddReview');

          doAddReview(req, res, location);
        }
      });
  } else {
    res
    .status(404)
    .json({"message": "Not found, locationid required" });
  }
 };

const doAddReview = (req, res, location) => {
  if (!location) {
    res 
      .status(404)
      .json({
        "message": "locationid not found"
      }); 
  } else {
    location.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    }); 
    location.save((err, location) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json(err);
      } else {
        updateAverageRating(location._id);
        let thisReview = location.reviews[location.reviews.length - 1]; 
         res
           .status(201)
           .json(thisReview);
      }   
    }); 
  } 

  const doSetAverageRating = (location) => {
    if (location.reviews && location.reviews.length > 0) {
      const count = location.reviews.length;
      const total = location.reviews.reduce((acc, {rating}) => {
        return acc + rating;

      }, 0);

      location.rating = parseInt(total / count, 10);
      location.save(err => {
        if (err) {
          console.log(err);

        } else {
          console.log(`Average rating updated to ${location.rating}`);
        }
      });
    }
  };

  const updateAverageRating = (locationId) => {
    Loc.findById(locationId)
    .select('rating reveiws')
    .exec((err, location) => {
      if(!err) {
        doSetAverageRating(location);
      }
    });
  };

 /*  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;

  console.log("DEBUG: doAddReview: locationid " + locationid);
  console.log("DEBUG: name: " + req.body.name);
  console.log("DEBUG: review: " + req.body.review);
  console.log("DEBUG: req.body" + JSON.stringify(req.body));

  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };

  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };

  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    console.log('DEBUG: error !postdata.author');
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {

    console.log('DEBUG: author rating reviewText ok');

    request (
      requestOptions,
      (err, {statusCode}, {name}) => {

        console.log('DEBUG: response: ' + response);

        if (statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        }
        else {
          showError(req, res, statusCode);
        }
      }
    );
  } */
};

const reviewsReadOne = (req, res) => {
  Loc
    .findById(req.params.locationid)
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

const doSetAverageRating = (location) => {
  if (location.reviews && location.reviews.length > 0) {
    const count = location.reviews.length;
    const total = location.reviews.reduce((acc, {rating}) => {
      return acc + rating;
    }, 0);
    location.rating = parseInt(total / count , 10);
    location.save(err => {
      if(err) {
        console.log(err);
      } else {
        console.log(`Average rating updated to ${location.rating}`);
      }
    });
  }
};

const updateAverageRating = (locationId) => {
  Loc.findById(locationId)
    .select('rating reviews')
    .exec((err, location) => {
      if(!err) {
        doSetAverageRating(location)
      }
    })
}

const reviewsUpdateOne = (req, res) => {
  if(!req.params.locationid || !req.params.reviewid) {
    return res
      .status(404)
      .json({
        "message": "Not found, locationid and reviewid are both required"
      });
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec((err, location) => {
      if(!location) {
        return res
          .status(404)
          .json({
            "message": "Location not found"
          });
      } else if (err) {
        return res
          .status(400)
          .json(err)
      }
      if (location.reviews && location.reviews.length > 0) {
        const thisReview = location.reviews.id(req.params.reviewid);
        if (!thisReview) {
          res
            .status(404)
            .json({
              "message": "Review not found"
            });
        } else {
          thisReview.author = req.body.author;
          thisReview.rating = req.body.rating;
          thisReview.reviewText = req.body.reviewText;
          location.save((err, location) => {
            if (err)  {
              res
                .status(404)
                .json(err)
            } else {
              updateAverageRating(location._id);
              res
                .status(200)
                .json(thisReview);
            }
          });
        }
      } else {
        res
          .status(404)
          .json({
            "message": "No review to update"
          });
      }
    }
    );
};

const reviewsDeleteOne = (req, res) => {
  const {locationid, reviewid} = req.params;
  if(!locationid || !reviewid) {
    return res
      .status(404)
      .json({'message': 'Not found, locationid and reviewid are both required'});
  }

  Loc
    .findById(locationid)
    .select('reviews')
    .exec((err, location) => {
      if (!location) {
        return res
          .status(404)
          .json({'message': 'Location not found'});
      } else if (err) {
        return res
          .status(400)
          .json(err)
      }

      if (location.reviews && location.reviews.length > 0) {
        if (!location.reviews.id(reviewid)) {
          return res
            .status(404)
            .json({'message': 'Review not found'});
        } else {
          location.reviews.id(reviewid).remove();
          location.save(err => {
            if (err) {
              return res
                .status(404)
                .json(err);
            } else {
              updateAverageRating(location._id);
              res 
                .status(204)
                .json(null);
            }
          });
        }
      } else {
        res
          .status(404)
          .json({'message': "No Review to delete"});
      }
    });
};

module.exports = {
  reviewsCreate,
  reviewsReadOne, 
  reviewsUpdateOne,
  reviewsDeleteOne
};