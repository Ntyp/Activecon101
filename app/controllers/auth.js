const db = require("../database/database");
// ใช้ bcryptjs ดีกว่า
const bcrypt = require("bcryptjs");
const moment = require("moment");

// const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  const data = req.body;
  console.log(data);
  const saltRounds = 10;
  db.execute(
    "SELECT * FROM users WHERE email = ? ",
    [data.email],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
        return;
      }
      if (results.length > 0) {
        res.json({
          status: "404",
          success: false,
          message: "The user is already in the system.",
        });
        return;
      }
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(data.password, salt, function (err, hash) {
          db.execute(
            "INSERT INTO users (password, name,email,tel, role, position,created_at) VALUES (?,?, ?, ?, ?, ?,?)",
            [
              hash,
              data.name,
              data.email,
              data.tel,
              data.role,
              data.position,
              moment().format("YYYY-MM-DD HH:mm:ss"),
            ],
            function (err, results, fields) {
              if (err) {
                console.error(err);
                res.json({ status: "500", message: "Internal server error" });
                return;
              }
              res.json({
                status: "200",
                message: "User registered successfully",
                success: true,
              });
            }
          );
        });
      });
    }
  );
};

exports.updateUser = async (req, res) => {
  const data = req.body;
  if (data.type == "name") {
    db.query(
      "UPDATE users SET name = ? WHERE id = ?",
      [data.name, data.id],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "500", message: err });
          return;
        }
        res.json({ status: "200", success: true });
      }
    );
  } else if (data.type == "email") {
    db.query(
      "UPDATE users SET email = ? WHERE id = ?",
      [data.email, data.id],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "500", message: err });
          return;
        }
        res.json({ status: "200", success: true });
      }
    );
  } else if (data.type == "tel") {
    db.query(
      "UPDATE users SET tel = ? WHERE id = ?",
      [data.tel, data.id],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "500", message: err });
          return;
        }
        res.json({ status: "200", success: true });
      }
    );
  }
};

exports.deleteUser = async (req, res) => {
  const data = req.body;
  db.execute(
    "SELECT * FROM users WHERE email = ?",
    [data.email],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
        return;
      }
      if (results.length == 0) {
        res.json({ status: "404", success: false, message: "User not found" });
        return;
      }
      db.query(
        "DELETE FROM users WHERE email = ?",
        data.email,
        function (err, results, fields) {
          if (err) {
            res.json({ status: "500", message: err });
            return;
          }
          res.json({ status: "200", data: results, success: true });
        }
      );
    }
  );
};

exports.login = (req, res) => {
  const data = req.body;
  db.execute(
    "SELECT * FROM users WHERE email = ?",
    [data.email],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
      if (results.length == 0) {
        return res.json({
          status: "404",
          success: false,
          message: "User not found",
        });
      }
      const password_db = results[0].password;
      bcrypt.compare(data.password, password_db, function (err, isLogin) {
        if (isLogin) {
          const payload = {
            id: results[0].id,
            name: results[0].name,
            role: results[0].role,
            position: results[0].position,
            email: results[0].email,
            tel: results[0].tel,
          };
          res.json({
            status: "200",
            data: payload,
            message: "Login Success",
            success: true,
          });
        } else {
          res.status(401).json({
            status: "401",
            message: "email and password do not match",
            success: false,
          });
        }
      });
    }
  );
};

// exports.authen = async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     let decoded = jwt.verify(token, secret);
//     res.json({ status: "200", decoded, success: true });
//   } catch (err) {
//     res.json({ status: "500", message: err, success: false });
//   }
// };

// exports.authenUser = async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     var decoded = jwt.verify(token, secret);
//     res.json({ status: "200", decoded });
//   } catch (err) {
//     res.json({ status: "500", message: err.message });
//   }
// };

// exports.logout = async (req, res) => {
//   const authHeader = req.headers["Authorization"];
//   jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
//     if (logout) {
//       res.send({
//         status: "200",
//         message: "You have been Logged Out!",
//         success: true,
//       });
//     } else {
//       res.send({ msg: "Error" });
//     }
//   });
// };

// listAll
exports.listUser = async (req, res) => {
  db.execute("SELECT * FROM users", function (err, results, fields) {
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

exports.checkUser = async (req, res) => {
  const data = req.body;
  db.execute(
    "SELECT * FROM users WHERE email = ?",
    [data.email],
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

exports.editUserByAdmin = async (req, res) => {
  const data = req.body;
  console.log(data);
  db.execute(
    "UPDATE users SET name = ?,tel = ?,position = ?,role = ? WHERE id = ?",
    [data.name, data.tel, data.position, data.role, data.id],
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

exports.deleteUserByAdmin = async (req, res) => {
  const data = req.body;
  db.execute(
    "DELETE FROM users WHERE id = ?",
    [data.id],
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

exports.createProject = async (req, res) => {
  const data = req.body;
  db.execute(
    "SELECT * FROM project WHERE name = ? OR code = ?",
    [data.name, data.code],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
      if (results.length != 0) {
        res.json({
          status: "400",
          msg: "Project already  create.",
          success: false,
        });
      }
      res.json({ status: "200", data: results, success: true });
    }
  );
};
