const conn = require("../utils/db");
const { bcryptPassword, compareHashPassword } = require("../utils/bcrypt");
const saltRounds = 10;

exports.testAuth = async (req, res ) => {
  res.status(200);
  res.json({
    status: "success",
    username: req.user
  });
  return res;
}
  
exports.postLogin = async (req, res) => {
  const { username, userpass } = req.body;
  const vals = [username, userpass];
  console.log(vals);

  const getuserSQL = `SELECT password_saltedhash, user_id, username FROM user WHERE username = ?`;

  await conn.query(getuserSQL, username).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message: err,
      });
      return res;
    } else {
      const userpassbcryptmatch = await compareHashPassword(
        userpass,
        rows[0][0].password_saltedhash
      );

      if (userpassbcryptmatch) {
        const userid = rows[0][0].user_id;
        res.json({ username: username, id: userid });
        
        res.status(200);
      } else {
        res.status(401);
        res.json({
          status: "failure",
          message: `Invalid user credentials`,
        });
      }
    }
  });
};

exports.postRegister = async (req, res) => {
  const new_details = req.body;
  const plain_password = new_details.userpass;
  const encryptedpassword = await bcryptPassword(plain_password, saltRounds);
  const vals = [
    new_details.username,
    encryptedpassword,
    new_details.email,
    new_details.name,
    new_details.dob,
    new_details.gender,
  ];
  console.log(encryptedpassword);

  const userinsertSQL =
    "INSERT INTO user (username, password_saltedhash, email, name, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?)";
  
  await conn.query(userinsertSQL, vals).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message:
          err.code == "ER_DUP_ENTRY" || err.errno == 1062
            ? "Username already exists!"
            : "Unknown error",
      });

    } else {
      res.status(201);
      res.json({
        status: "success",
        message: `Record ID ${rows[0].insertId} added`,
      });
    }
  }).catch(err => {
    if (err.code == "ER_DUP_ENTRY" || err.errno == 1062) {
      res.status(409)
      res.json({
        message: "Username already exists!",
      });
      return
    }
    res.status(500);
    res.json({
      status: "failure",
      message: err
    });
    console.log(err);
  })
};