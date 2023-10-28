const db = require("../database/database");
const fs = require("fs");

exports.deleteFileByPath = async (req, res) => {
  const pathToFile =
    "C:/Users/nuttl699/Desktop/backend/dist/assets/test/test.txt";
  //   const pathToFile = req.body.pathFile;
  fs.unlink(pathToFile, function (err) {
    if (err) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
    } else {
      console.log("Successfully deleted the file.");
      res.json({ status: "200", success: true });
    }
  });
};
