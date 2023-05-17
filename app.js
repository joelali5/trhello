const express = require("express");
const passport = require("passport");
const app = express();
const { signup, login } = require("./controllers");
const utils = require("./utils/utils");
require("./auth");

app.use(express.json());

//TEST
app.get("/google-login", (req, res) => {
  res.send(`<a href="/google">Authenticate with Google</a>`);
});
app.get("/microsoft-login", (req, res) => {
  res.send(`<a href="/microsoft">Authenticate with Microsoft</a>`);
});

// Initiate authentication flow with Google
app.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

//Initiate the auth flow with microsoft
app.get(
  "/microsoft",
  passport.authenticate("microsoft", {
    session: false,
  })
);

//Handle failure
app.get("/failure", (req, res) => {
  res.send({ message: "An error has occured!" });
});

// Handle Google's callback after authentication
app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    session: false,
  }),
  function (req, res) {
    // User authenticated successfully, generate JWT token and send it to user;
    const token = utils.generateToken(parseInt(req.user.id));
    res.status(200).send({ token });
  }
);

// Handle Microsoft's callback after authentication
app.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    failureRedirect: "/failure",
    session: false,
  }),
  function (req, res) {
    // // Generate JWT token and send it to user;
    const token = utils.generateToken(parseInt(req.user.id));
    res.status(200).send({ token });
  }
);

//Check that user is authenticated with valid credentials
app.use("/google/callback", (err, req, res, next) => {
  if (req.query.code === "valid_code") {
    res.status(302).send("Authenticated");
  } else {
    next(err);
  }
});

app.use("/microsoft/callback", (err, req, res, next) => {
  if (req.query.code === "valid_code") {
    res.status(302).send("Authenticated");
  } else {
    next(err);
  }
});

app.post("/", signup);
app.post("/login", login);

//Error Handling
app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Bad Request!" });
});

app.use("/google/callback", function (err, req, res, next) {
  // Handle OAuth2.0 authentication errors
  if (req.query.error === "invalid_credentials") {
    // Handle the specific case of 'invalid_credentials' error
    res.status(401).send("Unauthorized");
  } else {
    // Handle other errors
    next(err);
  }
});

app.use("/microsoft/callback", (err, req, res, next) => {
  if (req.query.error === "invalid_credentials") {
    res.status(401).send("Unauthorized");
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "Invalid input!" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Server Error!");
});

module.exports = app;
