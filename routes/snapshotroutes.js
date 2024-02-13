const express = require("express");
const controller = require("../controllers/snapshotcontroller");

const router = express.Router();

router.get("/", controller.getSnapshots);
//router.get("/new", controller.getAddNewSnapshot);
router.get("/edit/:id", controller.selectSnapshot);


router.post("/new", controller.postNewSnapshot);
router.post("/edit/:id", controller.updateSnapshot);
router.delete("/del/:id", controller.deleteSnapshot);

router.get("/user/:id/snapshots", controller.getUserSnapshots);
//router.get("/user/:id/snapshots", controller.getSnapshots);
router.get("/defaultTriggers", controller.getDefaultTriggers);
module.exports = router;
