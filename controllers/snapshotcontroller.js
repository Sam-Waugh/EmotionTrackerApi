const conn = require("../utils/db");

async function getTriggerByName(name) {
  let sql = `SELECT default_trigger_id FROM default_trigger 
                    WHERE default_trigger_name = ?`;
  const [rows, fields] = await conn.query(sql, [name]);
  return rows[0];
}

exports.getDefaultTriggers = async (req, res) => {
  //const userid = req.params.id;

  const defaulttriggerSQL = `SELECT default_trigger_id, default_trigger_name FROM default_trigger`;

  /*try {
      const [default_triggers, fielddata2] = await conn.query(defaulttriggerSQL);
      res.status(200);
      res.json(default_triggers);
      return res;
    } catch (err) {
      res.status(500);
      res.json({ error: "Internal Server Error" });
      return res;
      }*/
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
          //message: `Records ID ${id} retrieved`,
          result: rows[0],
        });
        return res;
      } else {
        res.status(404);
        res.json({
          status: "failure",
          //message: `Invalid ID ${id}`,
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
          //message: `Records ID ${id} retrieved`,
          result: result,
        });
        return res;
      } else {
        res.status(404);
        res.json({
          status: "failure",
          //message: `Invalid ID ${id}`,
        });
        return res;
      }
    }
  });
};

exports.selectSnapshot = async (req, res) => {
  //TODO add validation to check snapshot id belongs to userid logged in, if not err

  const { userid, id } = req.params;
  const vals = [userid, id];

  /* var snapshotSQL = `SELECT * FROM emotional_snapshot WHERE emotional_snapshot.emotional_snapshot_id = ?;`;
  snapshotSQL += `SELECT default_trigger.default_trigger_name, default_trigger.default_trigger_id FROM snapshot_default_trigger 
                        INNER JOIN default_trigger ON
                        snapshot_default_trigger.default_trigger_id = default_trigger.default_trigger_id
                        WHERE emotional_snapshot_id = ?;`;
                */

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
        //console.log(rows[1]);
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

  /*try {
                        
            const [snapshotdetails, fielddata1] = await conn.query(snapshotSQL, vals);
            const [defaulttriggerdetails, fielddata2] = await conn.query(defaulttriggerSQL, vals);

            $f3=>set('defaulttriggerdetails',json_encode($defaulttriggerdetails));

            res.render("editsnapshot", {
              loggedin: isloggedin,
              snapshot: snapshotdetails,
              defaulttriggers: defaulttriggerdetails,
            });
        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect('/');
    }*/
};

exports.postNewSnapshot = async (req, res) => {
  //try {
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

  //TODO validate the inputs
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
  /*}.catch(error) {
      //await conn.rollback;
      res.status(400);
      res.json({
          status: "failure",
          message: `Not recognised`,
      });
        };*/
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
  /*}.catch(error) {
      //await conn.rollback;
      res.status(400);
      res.json({
          status: "failure",
          message: `Not recognised`,
      });
        };*/
};
/*
  try {
    const [updatedsnapshot, fielddata1] = await conn.query(
      updatesnapshotSQL,
      vals1
    );
    const [deleteddefaulttrigger, fielddata2] = await conn.query(
      deletedefaulttriggerSQL,
      snapshot_id
    );
    const [defaulttriggerdetails, fielddata3] = await conn.query(
      defaulttriggerSQL
    );
    //const [defaulttriggerid] = await conn.query(defaulttriggeridSQL, default_trigger_name);

    ///const default_trigger_id = (async () => {console.log(await getTriggerByName(default_trigger_name))})()
    const default_trigger = await getTriggerByName(default_trigger_name);

    console.log(default_trigger);
    //default_trigger_id = default_trigger_info[0].default_trigger_id;
    const default_trigger_details = {
      default_trigger: default_trigger,
      default_trigger_name: default_trigger_name,
    };
    console.log(default_trigger_details);

    const [updateddefaulttrigger, fielddata4] = await conn.query(
      updatedefaulttriggerSQL,
      [snapshot_id, default_trigger.default_trigger_id]
    );

    console.log(updatedsnapshot);
    console.log(updateddefaulttrigger);
    console.log(deleteddefaulttrigger);
    console.log(defaulttriggerdetails);
    console.log(default_trigger);

    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};
*/

exports.deleteSnapshot = async (req, res) => {
  const { userid, id } = req.params;
  vals = [id, id];

  //add validation only delete if userid matches snapshotid owner

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
