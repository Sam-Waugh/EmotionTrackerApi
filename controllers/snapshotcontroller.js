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
    })
};

exports.getUserSnapshots = async (req, res) => {
   const { userid } = req.params;
  
    var getSnapshotsSQL = "SELECT emotional_snapshot.*, GROUP_CONCAT(snapshot_default_trigger.default_trigger_id SEPARATOR ',') AS default_trigger_ids FROM emotional_snapshot \
        JOIN snapshot_default_trigger on emotional_snapshot.emotional_snapshot_id = snapshot_default_trigger.emotional_snapshot_id \
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
            var result = rows[0]
            result.forEach((snapshot) => {
                snapshot.default_trigger_ids = snapshot.default_trigger_ids.split(',').map(Number);
            })
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

  /* const snapshotSQL = `SELECT * FROM emotional_snapshot 
                        WHERE emotional_snapshot.user_id = ?`;

  try {
    res.status(200);
    res.json(snapshotdetails);
  } catch (err) {
    res.status(500);
    res.json({ error: "Internal Server Error" });
    return res;
  }*/
};

/*exports.getSnapshots = async (req, res) => {
  var userinfo = {};
  const { isloggedin, userid } = req.session;
  console.log(`User data from session: ${isloggedin}, ${userid}`);

  if (isloggedin) {
    const getuserSQL = `SELECT user.username FROM user
                        WHERE user.user_id = '${userid}'`;
    const snapshotSQL = `SELECT * FROM emotional_snapshot 
                        WHERE emotional_snapshot.user_id = ${userid}`;
    const defaulttriggerSQL = `SELECT default_trigger.default_trigger_name FROM snapshot_default_trigger 
                        INNER JOIN default_trigger ON
                        snapshot_default_trigger.default_trigger_id = default_trigger.default_trigger_id`;

    try {
      const [userdetails, fielddata1] = await conn.query(getuserSQL, userid);
      const [snapshotdetails, fielddata2] = await conn.query(
        snapshotSQL,
        userid
      );
      const [defaulttriggerdetails, fielddata3] = await conn.query(
        defaulttriggerSQL,
        userid
      );

      console.log(userdetails);
      const username = userdetails[0].username;
      const session = req.session;
      session.name = username;
      console.log(session);
      userinfo = { name: username };
      console.log(userinfo);

      console.log(snapshotdetails);
      console.log(defaulttriggerdetails);

      res.render("index", {
        user: userinfo,
        loggedin: isloggedin,
        snapshot: snapshotdetails,
        defaulttriggers: defaulttriggerdetails,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.redirect("/login");
  }
};*/

/*exports.getAddNewSnapshot = async (req, res) => {

    const { isloggedin } = req.session;
    console.log(`User logged in: ${isloggedin}`);

    if (isloggedin) {
        res.render('addsnapshot');
    } else {
        res.redirect('/');
    }
};*/

exports.selectSnapshot = async (req, res) => {
  //const { isloggedin} = req.session;
  //console.log(`User logged in: ${isloggedin}`);

  //TODO add validation to check snapshot id belongs to userid logged in, if not err

  const { userid, id } = req.params;
  const vals = [id, id];

  var snapshotSQL = `SELECT * FROM emotional_snapshot WHERE emotional_snapshot.emotional_snapshot_id = ?;`;
  snapshotSQL += `SELECT default_trigger.default_trigger_name FROM snapshot_default_trigger 
                        INNER JOIN default_trigger ON
                        snapshot_default_trigger.default_trigger_id = default_trigger.default_trigger_id
                        WHERE emotional_snapshot_id = ?;`;

  await conn.query(snapshotSQL, vals).then(async (rows, err) => {
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
          message: `Record ID ${id} retrieved`,
          result: rows,
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
    new_details.enjoyment_level,
    new_details.sadness_level,
    new_details.anger_level,
    new_details.contempt_level,
    new_details.disgust_level,
    new_details.fear_level,
    new_details.surprise_level,
    new_details.notes,
  ];
  vals = vals.concat(new_details.snapshot_trigger_ids);

  //TODO validate the inputs
  var insertSQL = `INSERT INTO emotional_snapshot (user_id, enjoyment_level, sadness_level, anger_level, contempt_level, disgust_level, fear_level, surprise_level, notes) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  insertSQL += `SET @snapshot_id = LAST_INSERT_ID();`;
  for (id in new_details.snapshot_trigger_ids) {
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
  var vals = [
    id,
    new_details.notes,
  ];
  vals = vals.concat(new_details.snapshot_trigger_ids);

    var updatesnapshotSQL = `SET @snapshot_id = ?;`;
    updatesnapshotSQL +=
      "UPDATE emotional_snapshot SET notes = ? WHERE emotional_snapshot_id = @snapshot_id; ";
    updatesnapshotSQL += `DELETE FROM snapshot_default_trigger WHERE emotional_snapshot_id = @snapshot_id ;`;
    for (trigger_id in new_details.snapshot_trigger_ids) {
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
        res.set(
          "Location",
          `http://localhost:3002/user/${userid}/edit/${id}`
        );
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
  //const snapshot_id = req.params.id;

  //add validation only delete if userid matches snapshotid owner

  const deleteSQL = `DELETE FROM emotional_snapshot WHERE emotional_snapshot_id = ?`;

  await conn.query(deleteSQL, id).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        error: "Internal Server Error",
        message: err,
      });
      return res;
    } else {
      if (rows[0].ResultSetHeader.affectedRows > 0) {
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
