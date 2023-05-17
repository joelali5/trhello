const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  passwordMatch: async (password, hashedPassword) => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  },

  isEmailValid: (email) => {
    return /\S+@\S+\.\S+/.test(email);
  },

  generateToken: (id) => {
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return token;
  },
};
