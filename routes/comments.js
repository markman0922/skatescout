var express = require("express");
var router = express.Router({mergeParams: true});
var Spot = require("../models/spot");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Spot.findById(req.params.id, function(err, spot){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {spot: spot});
        }
    });
});


// comments create
router.post("/", middleware.isLoggedIn, function(req, res){
    // lookup campground using id
    Spot.findById(req.params.id, function(err, spot){
        if(err){
            console.log(err);
            res.redirect("/spots");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    spot.comments.push(comment._id);
                    spot.save();
                    console.log(comment);
                    req.flash("success", "Successfully added comment");
                    res.redirect('/spots/' + spot._id);
                }
            });
        }
    });
});  
// Comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Spot.findById(req.params.id, function(err, foundSpot) {
    if(err || !foundSpot) {
        req.flash("error", "No skate spot found");
        return res.redirect("back");
    }
      Comment.findById(req.params.comment_id, function(err, foundComment) {
         if(err){
             res.redirect("back");
         } else {
             res.render("comments/edit", {spot_id: req.params.id, comment: foundComment}); 
         }
     }); 
   });
});

// Comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/spots/" + req.params.id );
        }
    });
    
});

// Comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment successfully deleted!");
            res.redirect("/spots/" + req.params.id);
        }
    });
    
});


module.exports = router;