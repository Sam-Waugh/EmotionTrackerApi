const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv").config({ path: "./config.env" });
const session = require("express-session");
const snapshotrouter = require("./routes/snapshotroutes");
const userrouter = require("./routes/userroutes");

const app = express();

//
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.use(
//   session({
//     secret: "mysecretstring1234",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

app.use("/", snapshotrouter);
app.use("/", userrouter);

app.listen(process.env.PORT, (err) => {
  if (err) return console.log(err);

  console.log(`Express listening on port ${process.env.PORT}`);
});
