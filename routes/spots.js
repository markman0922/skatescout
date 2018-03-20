var express = require("express");
var router = express.Router();
var Spot = require("../models/spot");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX - show all campgrounds
router.get("/", function(req, res){
    // get all campgrounds from DB
    Spot.find({}, function(err, allSpots){
        if(err){
            console.log(err);
        } else {
            res.render("spots/index", {spot:allSpots, page: 'spots', currentUser: req.user});
        }
    });
});

// CREATE - add new spot to DB
router.post("/", middleware.isLoggedIn, function(req, res){
   // get data from form and add to campgrounds array
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   geocoder.geocode(req.body.location, function (err, data){
       if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
       }
       var lat = data[0].latitude;
       var lng = data[0].longitude;
       var location = data[0].formattedAddress;
 
       var newSpot = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
       // Create a new spot and save to DB
       Spot.create(newSpot, function(err, newlyCreated){
           if(err){
               console.log(err);
           } else {
             // redirect back to campgrounds page
                res.redirect("/spots");
           }
        });
    }); 
});
  
// NEW - show form to create new spot
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("spots/new");
});

// SHOW - shows more info about one spot
router.get("/:id", function(req, res){
    //find the campground with provided id
    Spot.findById(req.params.id).populate("comments").exec(function(err, foundSpot){
        if(err || !foundSpot){
            req.flash("error", "Spot not found");
            res.redirect("back");
        } else {
            console.log(foundSpot);
            //render show template with that spot
            res.render("spots/show", {spot: foundSpot});
        }
    });
});

// Edit Spot Route
router.get("/:id/edit", middleware.checkSpotOwnership, function(req, res) {
    Spot.findById(req.params.id, function(err, foundSpot){
        if (err){
            console.log(err);
        } else {
        res.render("spots/edit", {campground: foundSpot});
        }
    });
});

// Update Spot Route
router.put("/:id", middleware.checkSpotOwnership, function(req, res){
     geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, location: location, lat: lat, lng: lng};
    Spot.findByIdAndUpdate(req.params.id, newData, function(err, spot){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/spots/" + spot._id);
        }
    });
  });
});

// Destroy Spot router
router.delete("/:id", middleware.checkSpotOwnership, function(req, res){
    Spot.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/spots");
       } else {
           res.redirect("/spots");
       }

    
    });
});


module.exports = router;