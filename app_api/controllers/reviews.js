const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

const reviewsCreate = (req, res) => { };

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


module.exports = {
  reviewsCreate,
  reviewsReadOne, 
/*  reviewsUpdateOne,
  reviewsDeleteOne */
};