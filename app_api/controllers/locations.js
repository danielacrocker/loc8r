
const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

// const locationsCreate = (req, res) => { };

const locationsCreate = (req, res) => {
  console.log("api locations.js locationsCreate");
  res
    .status(200)
    .json({"status" : "success"});
}

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
module.exports = {
  // locationsListByDistance,
  locationsCreate
  ,locationsReadOne,
  /* locationsUpdateOne, 
  locationsDeleteOne */
}