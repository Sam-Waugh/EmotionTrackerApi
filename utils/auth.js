const jwt = require("jsonwebtoken");

function GenerateAccessToken(user) {
  return jwt.sign(
    { user_id: user.id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

async function Authenticate(req, res, next) {
  try {
    const authHeader = req.headers["authorization"]; // get the session cookie from request header

      if (!authHeader) return res.sendStatus(401); // if there is no cookie from request header, send an unauthorized response.
      //const authorisation = authHeader.split("=")[1];

    // Verify using jwt to see if token has been tampered with or if it has expired.
    // that's like checking the integrity of the cookie
    jwt.verify(
      authHeader,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          // if token has been altered or has expired, return an unauthorized error
          return res
            .status(401)
            .json({ message: "Invalid Token, please login" });
        }

        const { user_id, username } = decoded; // get user id from the decoded token
        req.user = { user_id, username }; // put the data object into req.user
        next();
      }
    );
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

//module.exports = [GenerateAccessToken, Authenticate];
module.exports = {
  GenerateAccessToken: GenerateAccessToken,
  Authenticate: Authenticate,
};