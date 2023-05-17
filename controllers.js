const { registerUser, loginMember } = require("./models");
const utils = require("./utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const { email, password } = req.body;

  //Check that the user has filled in required credentials
  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Please fill in the required fields..." });
  }

  //Check that their email is valid
  if (!utils.isEmailValid(email)) {
    return res.status(400).send({
      message: "You have entered an invalid email, please try again!",
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await registerUser(email, hashedPassword);
    res.status(201).send({ user: user, message: "Registration Successful!" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Please fill in the missing fields!" });
  }
  if (!utils.isEmailValid(email)) {
    return res.status(400).send({
      meesage: "You have entered an incorrect email address! Please try again.",
    });
  }
  try {
    const { member, passwordMatch } = await loginMember(email, password);
    let token;
    if (member.rowCount === 0 || passwordMatch === false) {
      return res.status(404).send({ message: "Incorrect email or password!" });
    } else {
      token = utils.generateToken(member.rows[0].member_id);
      res.status(200).send({ token });
    }
  } catch (error) {
    next(error);
  }
};

exports.authenticate = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    res.status(401).send({ message: "Unauthorised! Login to gain access." });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).send({ message: "Forbidden! Invalid access token." });
    }
    req.user = user;
  });
  next();
};
