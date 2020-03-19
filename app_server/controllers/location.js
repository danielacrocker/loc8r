const request = require('request');
const bodyParser = require('body-parser')

const apiOptions = {
  server: 'http://localhost:3000'
};

<<<<<<< HEAD
const renderDetailPage = (req, res, location) => {
  res.render('location-info', 
  {
    title: location.name,
    pageHeader: {
      title: location.name
    },
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like  it - or if you don\'t please leave a review to help other people just like you.'
    },
    location   
=======
const locationInfo = function(req, res) {
  getLocationInfo(req, res,
    (req, res, responseData) => {
      renderDetailPage(req, res, responseData);
    }); 
};

const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {}
  };
  request(
    requestOptions,
    (err, response, body) => {
      let data = body;
      if (response.statusCode === 200) {
        data.coords = {
          lng: body.coords[0],
          lat: body.coords[1]
        };
        callback(req, res, data);
      } else {
        showError(req, res, response.statusCode);
      }
    }
  );
};

const showError = (req, res, status) => {
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
>>>>>>> detachedbranch
  });
}

/* GET 'Location info' page */
const locationInfo = (req, res) => {
  //const path = `/api/locations/${req.params.locationid}`;
  const path = `/api/locations/${req.params.id}`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {}
  };
  request(
    requestOptions,
    (err, response, body) => {
      const data = body;
      data.coords = {
        lng: body.coords[0],
        lat: body.coords[1]
      };
      renderDetailPage(req, res, data);
    }
  );
};

/* GET 'Add review' page */
const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
  );
};

const doAddReview = (req, res) => {

  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;

  console.log('DEBUG: app_server doAddReview: author: ' + req.body.name);
  console.log('DEBUG: app_server doAddReview: rating: ' + req.body.rating);
  console.log('DEBUG: app_server doAddReview: review: ' + req.body.review);
  
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };

  const requestOptions = {
    url: apiOptions.server + path,
    method: 'POST',
    json: postdata
  };

  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect('/location/${locationid}/review/new?err=val');
  } else {
    console.log('DEBUG: locations.js doAddReview requestOptions: ' + JSON.stringify(requestOptions));

    request (
      requestOptions,
      (err, response, body) => {
        console.log('DEBUG: requestOptions: ' + JSON.stringify(requestOptions));
        console.log('DEBUG request response.statusCode: ' + response.statusCode);
        
        if (response.statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError') {
          console.log('DEBUG: === 400: ' + response.statusCode);
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          console.log('DEBUG: else other error' + response.statusCode);
          showError(req, res, response.statusCode);
        }
      }
    );
  }
};

const renderHomepage = (req, res, responseBody) => {
  let message = null;
  // if (!(responseBody instanceof Array)) {
  console.log('DEBUG ' + JSON.stringify(responseBody));
  
  if(responseBody === null) {
    console.log('DEBUG responseBody null')
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }
  console.log('DEBUG: responseBody: ' + JSON.stringify(responseBody));
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find plcase to work when out and about. Perhaps with coffee, cake or a pint ? Let Loc8r help you find the place you're looking for.",
    locations: responseBody, message
  });
};

const renderDetailPage = function(req, res, location) {
  console.log('DEBUG: renderDetailPage');
  res.render('location-info', {
    title: location.name,
    pageHeader: {
      title: location.name
    },
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and space to sidt down with your laptop and get some work done.',
      callToAction: "If you\ve been and you like it - or if you don't - please leave a review to help other people just like you."
    },
    location
  });
}

const renderReviewForm = (req, res, {name}) => {
  res.render('location-review-form', {
    title: `Review ${name} on Loc8r`,
    pageHeader: { title: `Review ${name}` }
  });
}

const homelist = (req, res) => {
  const path = '/api/locations';
  const requestOptions = {
    uri: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {},
    qs: {
      lng: -0.7992599,
      lat: 51.378091,
      maxDistance: 20
/*       lng: 1,
      lat: 1,
      maxDistance : 0.002 */
    }
  };
  request(requestOptions, (err, {statusCode}, body) => 
    {
      const data = body;
      console.log(JSON.stringify(data));
/*       data.coords = {
        lng: body.coords[0],
        lat: body.coords[1]
      }; */
      renderDetailPage(req, res, data);
/*       let data = [];
      if (statusCode === 200 && body.length) {
        data = body.map((item) => {
          item.distance = formatDistance(item.distance);
          return item;
        });
      }
<<<<<<< HEAD
      renderHomepage(req, res, data); */
    // }
=======
      console.log('DEBUG: renderHomepage');
      renderHomepage(req, res, data);
>>>>>>> detachedbranch
    }
  );
};

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit = 'km';
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
}

module.exports = {
 homelist,
 locationInfo,
 addReview,
 doAddReview
};
