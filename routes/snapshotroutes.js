const express = require("express");
const controller = require("../controllers/snapshotcontroller");
const apiusercontroller = require("../controllers/apiusercontroller");
const API = require("../utils/apiAuth");

const router = express.Router();

router.get(
  "/user/:userid/edit/:id",
  apiusercontroller.authenticateApiKey,
  controller.selectSnapshot
);
router.get(
  "/user/:userid/snapshots",
  apiusercontroller.authenticateApiKey,
  controller.getUserSnapshots
);
router.get(
  "/defaultTriggers",
  apiusercontroller.authenticateApiKey,
  controller.getDefaultTriggers
);

router.post(
  "/user/:userid/new",
  apiusercontroller.authenticateApiKey,
  controller.postNewSnapshot
);
router.put(
  "/user/:userid/edit/:id",
  apiusercontroller.authenticateApiKey,
  controller.updateSnapshot
);
router.delete(
  "/user/:userid/del/:id",
  apiusercontroller.authenticateApiKey,
  controller.deleteSnapshot
);

module.exports = router;
