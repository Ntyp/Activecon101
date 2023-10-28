const express = require("express");
const db = require("./database/database");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const moment = require("moment");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(cors());

// Route
// http://localhost:6969/api/
app.use("/api", require("./routes/api"));

// Connect Database
db.connect((err) => {
  if (err) throw err;
  console.log("Database  Connected!!");
});

const PORT = process.env.PORT;
app.listen(PORT || 6969, function () {
  console.log(`Server is running on PORT:${PORT}`);
});
