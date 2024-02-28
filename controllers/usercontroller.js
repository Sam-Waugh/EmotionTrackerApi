const conn = require("../utils/db");
const auth = require("../utils/auth");
const { bcryptPassword, compareHashPassword } = require("../utils/bcrypt");
//const generateAccessToken = require("./generateAccessToken")
//import the generateAccessToken function

// const bcrypt = require("bcrypt");
const saltRounds = 10;

/* async function getSavedHashPassword(username) {
  let getsaltedhashpassSQL = `SELECT password_saltedhash FROM user WHERE username = ?`;

  const [rows, fields] = await conn.query(getsaltedhashpassSQL, [username]);
  return rows[0];
}*/

exports.testAuth = async (req, res ) => {
  res.status(200);
  res.json({
    status: "success",
    username: req.user
  });
  return res;
}
 
/*exports.getLogin = async (req, res) => {
  res.render("login");
};*/


/*
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
        console.log("---------> Generating accessToken");
        const token = await auth.GenerateAccessToken({ id: userid, username: username });
        console.log(token);
        res.json({ accessToken: token });

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
*/
  
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

/*exports.postLogout = async (req, res) => {
  req.session.destroy(() => {
  res.redirect("/");
  });*/
   
  /*try {
     //const authHeader = req.headers["cookie"]; // get the session cookie from request header
     if (!authHeader) return res.sendStatus(204); // No content
     //const cookie = authHeader.split("=")[1]; // If there is, split the cookie string to get the actual jwt token
     //const accessToken = cookie.split(";")[0];
     //const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
     // if true, send a no content response.
     //if (checkIfBlacklisted) return res.sendStatus(204);
     // otherwise blacklist token
     //const newBlacklist = new Blacklist({
     //  token: accessToken,
     //});
     //await newBlacklist.save();
     // Also clear request cookie on client
     res.setHeader("Clear-Site-Data", '"cookies"');
     res.status(200).json({ message: "You are logged out!" });
   } catch (err) {
     res.status(500).json({
       status: "error",
       message: "Internal Server Error",
     });
   }
  res.end();
  res.redirect("/login")
};*/

/*exports.getRegister = async (req, res) => {
  res.render("register");
};*/

exports.postRegister = async (req, res) => {
  //add check no current user with that email
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
        message: err,
      });

      //401 err?
    } else {
      res.status(201);
      res.json({
        status: "success",
        message: `Record ID ${rows[0].insertId} added`,
      });
    }
  });
};