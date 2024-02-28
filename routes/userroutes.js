const express = require("express");
const auth = require("../utils/auth")
const controller = require("../controllers/usercontroller");
const apiusercontroller = require("../controllers/apiusercontroller");
const router = express.Router();

router.post(
  "/login",
  apiusercontroller.authenticateApiKey,
  controller.postLogin
);
router.post(
  "/register",
  apiusercontroller.authenticateApiKey,
  controller.postRegister
);

module.exports = router;
