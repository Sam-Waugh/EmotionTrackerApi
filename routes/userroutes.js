const express = require("express");
const auth = require("../utils/auth")
const controller = require("../controllers/usercontroller");
const router = express.Router();

//router.get("/login", controller.getLogin);
//router.post("/logout", auth.Authenticate, controller.postLogout);
//router.get("/register", controller.getRegister);

router.post("/login", controller.postLogin);
router.post("/register", controller.postRegister);
router.get("/testauth", auth.Authenticate, controller.testAuth);
module.exports = router;
