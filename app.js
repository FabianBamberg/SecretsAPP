require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//const md5 = require("md5");
//const bcrypt = require('bcrypt');
//const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt,{secret : process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err);
    } else {
        res.redirect("/")
    }
  });
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');
  });

/*app.post("/login", function(req, res) {
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});*/

app.listen(3000, function() {
  console.log("Server running on port 3000");
});

/*
bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  const newUser = new User({
    email: req.body.username,
    password: hash
  });
  newUser.save(function(err) {
    if (!err) {
      res.render("secrets")
    } else {
      console.log(err);
    }
  });
});

User.findOne({
    email: req.body.username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
          if(result === true){
            res.render("secrets");
        } else {
          res.send("Incorrect password - Acces Denied");
        }
      });
    } else {
      res.send("User does not exist - Acces Denied");
    }
  }
}); */
