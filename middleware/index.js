var Spot = require("../models/spot");
var Comment = require("../models/comment");

// all middleware goes here
var middlewareObj = {};

middlewareObj.checkSpotOwnership = function(req, res, next) {
   if(req.isAuthenticated()){
        Spot.findById(req.params.id, function(err, foundSpot){
            if(err || !foundSpot){
                req.flash("error", "Skate spot not found");
                res.redirect("back");
            } else {
                // does user own campground
                if(foundSpot.author.id.equals(req.user._id)) {
                        next();                       
                    } else {
                    req.flash("error", "You do not have permission to do that");    
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }

};

middlewareObj.checkCommentOwnership = function(req, res, next) {
      if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                res.redirect("back");
            } else {
                // does user own comment
                if(foundComment.author.id.equals(req.user._id)) {
                    next();                       
                    } else {
                        req.flash("error", "Comment not found");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that!");
            res.redirect("back");
        }
};

// middleware

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};


module.exports = middlewareObj;