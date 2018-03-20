var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOveride = require("method-override"),
    Spot = require("./models/spot"),
    Comment = require("./models/comment"),
    User = require("./models/user");
   
    
// requiring routes
var commentRoutes = require("./routes/comments"),
    spotRoutes = require("./routes/spots"),
    indexRoutes = require("./routes/index");


mongoose.connect(process.env.DATABASEURL);


app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOveride("_method"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(flash());

app.locals.moment = require("moment");
// passport config
app.use(require("express-session")({
    secret: "This will eventually be on mobile!",
    resave: false,
    saveUninitialized: false
    
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");

   next();
});

app.use("/", indexRoutes);
app.use("/spots/:id/comments", commentRoutes);
app.use("/spots", spotRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SkateScout has started");
});