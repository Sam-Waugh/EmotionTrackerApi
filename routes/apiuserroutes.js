const express = require("express");
const apiAuth = require("../utils/apiAuth")
const controller = require("../controllers/apiusercontroller");
const router = express.Router();

router.post("/api/register", controller.postApiRegister);

module.exports = router;
