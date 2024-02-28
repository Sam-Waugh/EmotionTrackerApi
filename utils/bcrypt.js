const bcrypt = require("bcrypt");

async function compareHashPassword(password, hash) {
  const isSame = await bcrypt.compare(password, hash);
  console.log((password, hash));
  console.log(isSame);
  return isSame;
}

async function bcryptPassword(password, saltRounds) {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(hash);
  return hash;
}

module.exports = { compareHashPassword, bcryptPassword };