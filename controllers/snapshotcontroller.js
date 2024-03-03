const conn = require("../utils/db");

exports.getDefaultTriggers = async (req, res) => {

  const defaulttriggerSQL = `SELECT default_trigger_id, default_trigger_name FROM default_trigger`;

  await conn.query(defaulttriggerSQL).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message: err,
      });
      return res;
    } else {
      if (rows.length > 0) {
        res.status(200);
        res.json({
          status: "success",
          result: rows[0],
        });
        return res;
      } else {
        res.status(404);
        res.json({
          status: "failure",
        });
        return res;
      }
    }
  });
};

exports.getUserSnapshots = async (req, res) => {
  const { userid } = req.params;

  var getSnapshotsSQL =
    "SELECT emotional_snapshot.*, GROUP_CONCAT(snapshot_default_trigger.default_trigger_id SEPARATOR ',') AS default_trigger_ids FROM emotional_snapshot \
        LEFT JOIN snapshot_default_trigger ON emotional_snapshot.emotional_snapshot_id = snapshot_default_trigger.emotional_snapshot_id \
        WHERE emotional_snapshot.user_id = ? \
        GROUP BY emotional_snapshot.user_id, emotional_snapshot_id";

  await conn.query(getSnapshotsSQL, userid).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message: err,
      });
      return res;
    } else {
      if (rows.length > 0) {
        res.status(200);
        var result = rows[0];
        result.forEach((snapshot) => {
          if (snapshot.default_trigger_ids === null) {
          } else {
            snapshot.default_trigger_ids = snapshot.default_trigger_ids
              .split(",")
              .map(Number);
          }
        });
        res.json({
          status: "success",
          result: result,
        });
        return res;
      } else {
        res.status(404);
        res.json({
          status: "failure",
        });
        return res;
      }
    }
  });
};

exports.selectSnapshot = async (req, res) => {

  const { userid, id } = req.params;
  const vals = [userid, id];

  var getSnapshotSQL =
    "SELECT emotional_snapshot.*, GROUP_CONCAT(snapshot_default_trigger.default_trigger_id SEPARATOR ',') AS default_trigger_ids FROM emotional_snapshot \
        LEFT JOIN snapshot_default_trigger on emotional_snapshot.emotional_snapshot_id = snapshot_default_trigger.emotional_snapshot_id \
        WHERE emotional_snapshot.user_id = ? AND emotional_snapshot.emotional_snapshot_id = ? \
        GROUP BY emotional_snapshot.user_id, emotional_snapshot_id";

  await conn.query(getSnapshotSQL, vals).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message: err,
      });
      return res;
    } else {
      if (rows.length > 0) {
        res.status(200);
        var result = rows[0];
        result.forEach((snapshot) => {
          if (snapshot.default_trigger_ids === null) {
          } else {
            snapshot.default_trigger_ids = snapshot.default_trigger_ids
              .split(",")
              .map(Number);
          }
        });
        res.json({
          status: "success",
          message: `Record ID ${id} retrieved`,
          result: result,
        });
        console.log(rows[0]);
        return res;
      } else {
        res.status(404);
        res.json({
          status: "failure",
          message: `Invalid ID ${id}`,
        });
        return res;
      }
    }
  });
};

exports.postNewSnapshot = async (req, res) => {
  const userid = req.params.userid;
  const new_details = req.body;
  var vals = [
    userid,
    new_details.snapshot_enjoyment,
    new_details.snapshot_sadness,
    new_details.snapshot_anger,
    new_details.snapshot_contempt,
    new_details.snapshot_disgust,
    new_details.snapshot_fear,
    new_details.snapshot_surprise,
    new_details.snapshot_notes,
  ];
  if (!new_details.snapshot_trigger_ids) {
  } else {
    var snapshot_trigger_ids = Array.isArray(
      new_details.snapshot_trigger_ids)
      ? new_details.snapshot_trigger_ids.map(Number)
      : [Number(new_details.snapshot_trigger_ids)];
    vals = vals.concat(snapshot_trigger_ids);
  }

  var insertSQL = `INSERT INTO emotional_snapshot (user_id, enjoyment_level, sadness_level, anger_level, contempt_level, disgust_level, fear_level, surprise_level, notes) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  insertSQL += `SET @snapshot_id = LAST_INSERT_ID();`;
  for (id in snapshot_trigger_ids) {
    insertSQL +=
      "INSERT INTO snapshot_default_trigger (emotional_snapshot_id, default_trigger_id) VALUES ( @snapshot_id , ?);";
  }
  await conn.query(insertSQL, vals).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message: err,
      });
    } else {
      res.status(201);
      //tell the client where the created object can be retrieved from in header
      res.set(
        "Location",
        `http://localhost:3002/user/${userid}/edit/${rows[0][0].insertId}`
      );
      res.json({
        status: "success",
        message: `Record ID ${rows[0][0].insertId} added`,
        snapshot_id: rows[0][0].insertId
      });
    }
  });
};

exports.updateSnapshot = async (req, res) => {
  //TODO check if snapshot belongs to user
  const { userid, id } = req.params;
  const new_details = req.body;
  var vals = [id, new_details[0].snapshot_notes];
  if (!new_details[0].snapshot_trigger_ids) {
  } else {
    var snapshot_trigger_ids = Array.isArray(
      new_details[0].snapshot_trigger_ids)
      ? new_details[0].snapshot_trigger_ids.map(Number)
      : [Number(new_details[0].snapshot_trigger_ids)]; ;
    vals = vals.concat(snapshot_trigger_ids);
  }
    
  var updatesnapshotSQL = `SET @snapshot_id = ?;`;
  updatesnapshotSQL +=
    "UPDATE emotional_snapshot SET notes = ?, modified_ts = CURRENT_TIMESTAMP() WHERE emotional_snapshot_id = @snapshot_id; ";
  updatesnapshotSQL += `DELETE FROM snapshot_default_trigger WHERE emotional_snapshot_id = @snapshot_id ;`;
  for (trigger_id in snapshot_trigger_ids) {
    updatesnapshotSQL +=
      "INSERT INTO snapshot_default_trigger (emotional_snapshot_id, default_trigger_id) VALUES ( @snapshot_id , ?);";
  }

  await conn.query(updatesnapshotSQL, vals).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        message: err,
      });
    } else {
      res.status(201);
      //tell the client where the created object can be retrieved from in header
      res.set("Location", `http://localhost:3002/user/${userid}/edit/${id}`);
      res.json({
        status: "success",
        message: `Record ID ${id} updated`,
      });
    }
  });
};

exports.deleteSnapshot = async (req, res) => {
  const { userid, id } = req.params;
  vals = [id, id];

  var deleteSQL = `DELETE FROM emotional_snapshot WHERE emotional_snapshot_id = ?;`;
  deleteSQL += `DELETE FROM snapshot_default_trigger WHERE emotional_snapshot_id = ? ;`;

  await conn.query(deleteSQL, vals).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        error: "Internal Server Error",
        message: err,
      });
      return res;
    } else {
      if (rows[0][0].affectedRows > 0) {
        res.status(200);
        res.json({
          status: "success",
          message: `Record ID ${id} deleted`,
        });
        return res;
      } else {
        res.status(404);
        res.json({
          status: "failure",
          message: `Invalid ID ${id}`,
        });
        return res;
      }
    }
  });
};
