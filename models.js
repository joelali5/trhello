const db = require("./db/connection");
const utils = require("./utils/utils");

exports.registerUser = async (email, hashedPassword) => {
  const result = await db.query(
    "INSERT INTO members (email, password) VALUES ($1, $2) RETURNING *;",
    [email, hashedPassword]
  );
  return result.rows[0];
};

exports.loginMember = async (email, password) => {
  const member = await db.query("SELECT * FROM members WHERE email=$1;", [email]);
  let passwordMatch;
  if(member.rowCount > 0) {
    passwordMatch = await utils.passwordMatch(password, member.rows[0].password);
  }
  return {member, passwordMatch};
};
