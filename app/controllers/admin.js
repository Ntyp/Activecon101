const db = require("../database/database");
const moment = require("moment");

exports.approveStatusDocument = async (req, res) => {
  const data = req.body;
  const status = data.statusApprove == "approve" ? 1 : 2;
  db.execute(
    "UPDATE documents SET status = ? WHERE id = ?",
    [status, data.documents_id],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
      res.json({ status: "200", success: true });
    }
  );
};

exports.waitingApproveList = async (req, res) => {
  db.execute(
    "SELECT * FROM documents WHERE status = ?",
    ["waiting"],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
      res.json({ status: "200", data: results, success: true });
    }
  );
};

exports.listUsers = async (req, res) => {
  db.execute("SELECT * FROM users", function (err, results, fields) {
    if (err) {
      console.error(err);
      return res.json({
        status: "500",
        success: false,
        message: "Internal server error",
      });
    }
    const data = results.map((item) => ({
      id:item.id,
      name: item.name,
      position: item.position,
      email: item.email,
      tel: item.tel,
      role: item.role,
    }));
    res.json({ status: "200", data: data, success: true });
  });
};

exports.listProject = async (req, res) => {
  db.execute("SELECT * FROM project", function (err, results, fields) {
    if (err) {
      console.error(err);
      return res.json({
        status: "500",
        success: false,
        message: "Internal server error",
      });
    }
    res.json({ status: "200", data: results, success: true });
  });
};

exports.checkProject = async (req, res) => {
  const name = req.params["name"];
  db.execute(
    "SELECT * FROM project WHERE name = ?",
    [name],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
      res.json({ status: "200", data: results, success: true });
    }
  );
};

exports.createProject = async (req, res) => {
  const data = req.body;
  db.execute(
    "INSERT INTO project (name, code) VALUES (?,?)",
    [data.name, data.code],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        res.json({ status: "500", message: "Internal server error" });
        return;
      }
      res.json({
        status: "200",
        success: true,
      });
    }
  );
};

exports.updateProject = async (req, res) => {
  const data = req.body;
  console.log(data);
  db.execute(
    "UPDATE project SET name = ?, code = ? WHERE code = ?",
    [data.name, data.code, data.codeOld],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        res.json({ status: "500", message: "Internal server error" });
        return;
      }
      res.json({
        status: "200",
        success: true,
      });
    }
  );
};

exports.deleteProject = async (req, res) => {
  const data = req.body;
  db.execute(
    "DELETE FROM project WHERE code = ?",
    [data.code],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        res.json({ status: "500", message: "Internal server error" });
        return;
      }
      res.json({
        status: "200",
        success: true,
      });
    }
  );
};
