const express = require("express");
const passport = require("passport");
const app = express();
const { signup, login } = require("./controllers");
const utils = require("./utils/utils");
require("./auth");
const db = require("./db/connection");
const bcrypt = require("bcrypt");

app.use(express.json());

//TEST
app.get("/google-login", (req, res) => {
  res.send(`<a href="/google">Authenticate with Google</a>`);
});
app.get("/microsoft-login", (req, res) => {
  res.send(`<a href="/microsoft">Authenticate with Microsoft</a>`);
});

app.get("/github-login", (req, res) => {
  res.send(`<a href="/github">Authenticate with Github</a>`);
});

app.get("/facebook-login", (req, res) => {
  res.send(`<a href="/facebook">Authenticate with Facebook</a>`);
});

// Initiate authentication flow with Google
app.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Initiate the auth flow with microsoft
app.get(
  "/microsoft",
  passport.authenticate("microsoft", {
    session: false,
  })
);

// Initiate the auth flow with github
app.get(
  "/github",
  passport.authenticate("github", {
    session: false,
  })
);

//Initiate the auth flow from linkedin
app.get(
  "/facebook",
  passport.authenticate("facebook", {
    session: false,
  })
);
// Handle failure
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
  async function (req, res, next) {
    const email = req.user.emails[0].value;
    const firstname = req.user.name.givenName;
    const lastname = req.user.name.familyName;
    const password = await bcrypt.hash("12345", 10);
    let token;

    try {
      const user = await db.query("SELECT * FROM members WHERE email = $1;", [
        email,
      ]);

      if (user.rowCount === 0) {
        const newUser = await db.query(
          "INSERT INTO members (email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING *;",
          [email, password, firstname, lastname]
        );
        token = utils.generateToken(newUser.rows[0].member_id);
      }
      token = utils.generateToken(user.rows[0].member_id);
      res.status(200).send({ token });
    } catch (error) {
      next(error);
    }
  }
);
// Handle Microsoft's callback after authentication
app.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    failureRedirect: "/failure",
    session: false,
  }),
  async function (req, res, next) {
    const email = req.user.emails[0].value;
    const firstname = req.user.name.givenName;
    const lastname = req.user.name.familyName;
    const password = await bcrypt.hash("12345", 10);

    try {
      const user = await db.query("SELECT * FROM members WHERE email = $1;", [
        email,
      ]);
      if (user.rowCount === 0) {
        const newUser = await db.query(
          "INSERT INTO members (email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING *;",
          [email, password, firstname, lastname]
        );
        token = utils.generateToken(newUser.rows[0].member_id);
      }

      token = utils.generateToken(user.rows[0].member_id);
      res.status(200).send({ token });
    } catch (error) {
      next(error);
    }
  }
);
// Handle Github's callback after authentication
app.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/failure",
    session: false,
  }),
  async function (req, res, next) {
    const email = "enteryouremail@something.com";
    const password = await bcrypt.hash("12345", 10);
    const firstname = req.user.displayName.split(" ")[0];
    const lastname = req.user.displayName.split(" ")[1];

    try {
      const user = await db.query("SELECT * FROM members WHERE email = $1;", [
        email,
      ]);
      if (user.rowCount === 0) {
        const newUser = await db.query(
          "INSERT INTO members (email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING *;",
          [email, password, firstname, lastname]
        );
        token = utils.generateToken(newUser.rows[0].member_id);
      }
      token = utils.generateToken(user.rows[0].member_id);
      res.status(200).send({ token });
    } catch (error) {
      next(error);
    }
  }
);

//Handle Linkedin's callback after authentication
app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/failure",
    session: false,
  }),
  async function (req, res, next) {
    const password = await bcrypt.hash("12345", 10);
    const firstname = req.user.displayName.split(" ")[0];
    const lastname = req.user.displayName.split(" ")[1];
    const email = `${firstname}${lastname}@gmail.com`;

    try {
      const user = await db.query("SELECT * FROM members WHERE email = $1;", [
        email,
      ]);
      if (user.rowCount === 0) {
        const newUser = await db.query(
          "INSERT INTO members (email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING *;",
          [email, password, firstname, lastname]
        );
        token = utils.generateToken(newUser.rows[0].member_id);
      }
      token = utils.generateToken(user.rows[0].member_id);
      res.status(200).send({ token });
    } catch (error) {
      next(error);
    }
  }
);

// CHECK USERS ARE AUTHENTICATED WITH VALID CREDENTIALS
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

app.use("/github/callback", (err, req, res, next) => {
  if (req.query.code === "valid_code") {
    res.status(302).send("Authenticated");
  } else {
    next(err);
  }
});

app.use("/facebook/callback", (err, req, res, next) => {
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
  if (req.query.error === "invalid_credentials") {
    res.status(401).send("Unauthorized");
  } else {
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

app.use("/github/callback", (err, req, res, next) => {
  if (req.query.error === "invalid_credentials") {
    res.status(401).send("Unauthorized");
  } else {
    next(err);
  }
});

app.use("/facebook/callback", (err, req, res, next) => {
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
