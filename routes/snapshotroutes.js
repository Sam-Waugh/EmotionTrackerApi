const express = require("express");
const controller = require("../controllers/snapshotcontroller");

const router = express.Router();

//router.get("/", controller.getSnapshots);
//router.get("/new", controller.getAddNewSnapshot);
router.get("/user/:userid/edit/:id", controller.selectSnapshot);


router.post("/user/:userid/new", controller.postNewSnapshot);
router.put("/user/:userid/edit/:id", controller.updateSnapshot);
router.delete("/user/:userid/del/:id", controller.deleteSnapshot);

router.get("/user/:userid/snapshots", controller.getUserSnapshots);
//router.get("/user/:id/snapshots", controller.getSnapshots);
router.get("/defaultTriggers", controller.getDefaultTriggers);

module.exports = router;
