//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const port = 3000;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
}

const userSchema = new mongoose.Schema({
  // Without the 'new' it's just simple JS object. With it, it's a 'new' user schema created from tghe mongoose schema class.
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
}); // Add the encrypt package as a plugin
// Add the plugin to the schema before I create the mongoose model based on the same schema.
// Instead of encrypting the entire DB, encrypt only certai fields (that matches the name of at least one of the userSchema keys name)

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async function (req, res) {
  try {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    await newUser.save();
    res.render("secrets"); // Only rendering the secrets page from the register and login routes
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).then(function (foundUser) {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
