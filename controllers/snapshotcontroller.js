const conn = require("../utils/db");

async function getTriggerByName(name) {
  let sql = `SELECT default_trigger_id FROM default_trigger 
                    WHERE default_trigger_name = ?`;
  const [rows, fields] = await conn.query(sql, [name]);
  return rows[0];
}

exports.getDefaultTriggers = async (req, res) => {
  const userid = req.params.id;

  const defaulttriggerSQL = `SELECT default_trigger_id, default_trigger_name FROM default_trigger`;

  try {
    const [default_triggers, fielddata2] = await conn.query(defaulttriggerSQL);
    res.status(200);
    res.json(default_triggers);
    return res;
  } catch (err) {
    res.status(500);
    res.json({ error: "Internal Server Error" });
    return res;
  }
};

exports.getUserSnapshots = async (req, res) => {
    const userid = req.params.id;
    
        var getSnapshotsSQL = `SELECT * FROM emotional_snapshot 
                        WHERE emotional_snapshot.user_id = ?;`;
        getSnapshotsSQL += `SELECT default_trigger.default_trigger_name FROM snapshot_default_trigger 
                        INNER JOIN default_trigger ON
                        snapshot_default_trigger.default_trigger_id = default_trigger.default_trigger_id;`;
    
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
          res.json({
            status: "success",
            //message: `Records ID ${id} retrieved`,
            result: rows,
          });
          console.log(rows[0]);
          //console.log(rows[1]);
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
    const [snapshotdetails, fielddata2] = await conn.query(snapshotSQL, userid);
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

  const { id } = req.params;
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
  const userid = req.params.id;

  const { new_details, new_date } = req.body;
  const vals = [userid, new_details, new_date];

  const insertSQL =
    "INSERT INTO emotional_snapshot (user_id, notes, created_ts) VALUES (?, ?, ?)";

  try {
    const [newsnapshot, fields] = await conn.query(insertSQL, vals);
    console.log(newsnapshot);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.updateSnapshot = async (req, res) => {
  const snapshot_id = req.params.id;
  const snapshot_notes = req.body.snapshot_notes;
  const default_trigger_name = req.body.snapshot_default_trigger;
  const vals1 = [snapshot_notes, snapshot_id];
  //const default_trigger_name = req.body.default_trigger_name;
  //const vals2 = [snapshot_id, snapshot_default_triggers.default_trigger_id ];

  const updatesnapshotSQL =
    "UPDATE emotional_snapshot SET notes = ? WHERE emotional_snapshot_id = ?";
  const deletedefaulttriggerSQL = `DELETE FROM snapshot_default_trigger WHERE emotional_snapshot_id = ?`;
  const defaulttriggerSQL = `SELECT default_trigger.default_trigger_name FROM snapshot_default_trigger 
                        INNER JOIN default_trigger ON
                        snapshot_default_trigger.default_trigger_id = default_trigger.default_trigger_id`;
  //const defaulttriggeridSQL = `SELECT default_trigger_id FROM default_trigger
  //                    WHERE default_trigger_name = ?`;
  const updatedefaulttriggerSQL = `INSERT INTO snapshot_default_trigger (emotional_snapshot_id, default_trigger_id) VALUES (?, ?)`;

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

exports.deleteSnapshot = async (req, res) => {
  const snapshot_id = req.params.id;

  const deleteSQL = `DELETE FROM emotional_snapshot WHERE emotional_snapshot_id = ?`;

  await conn.query(deleteSQL, snapshot_id).then(async (rows, err) => {
    if (err) {
      res.status(500);
      res.json({
        status: "failure",
        error: "Internal Server Error",
        message: err,
      });
    } else {
      if (rows.affectedRows > 0) {
        res.status(200);
        res.json({
          status: "success",
          message: `Record ID ${snapshot_id} deleted`,
        });
      } else {
        res.status(404);
        res.json({
          status: "failure",
          message: `Invalid ID ${snapshot_id}`,
        });
      }
    }
  });
};
