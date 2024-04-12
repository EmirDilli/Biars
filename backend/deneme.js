const bcrypt = require("bcryptjs");

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}
function comparePassword(raw, hash) {
  return bcrypt.compareSync(raw, hash);
}

console.log(hashPassword("1234"));
