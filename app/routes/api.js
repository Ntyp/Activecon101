const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authen");

const {
  createUser,
  updateUser,
  deleteUser,
  listUser,
  checkUser,
  login,
  editUserByAdmin,
  deleteUserByAdmin,
} = require("../controllers/auth");

const {
  approveStatusDocument,
  waitingApproveList,
  listUsers,
  createProject,
  updateProject,
  deleteProject,
  listProject,
  checkProject,
} = require("../controllers/admin");
const {
  checkDocument,
  createDocument,
  exportHistory,
  listDocuments,
  listSummaryBoard,
  countByType,
  approve,
  disapprove,
  searchDataIntoTable,
  deleteDocuments
} = require("../controllers/documents");

const { exportToExcel,excelTest } = require("../controllers/exportExcel");

router.post("/login", login);
router.post("/userCreate", createUser);
router.post("/userUpdate", updateUser);
router.delete("/userDelete", deleteUser);
// router.get("/usersList", listUser);
router.get("/usersList", listUser);
router.get("/userCheck", checkUser);

router.post("/createDocument", createDocument);
router.post("/exportHistory", exportHistory);
router.get("/listDocuments", listDocuments);
router.get("/documents/:id", checkDocument);
router.get("/listSummaryBoard", listSummaryBoard);
router.post("/deleteDocuments", deleteDocuments);


router.get("/documentsCount/:type", countByType);

router.post("/approve", approve);
router.post("/disapprove", disapprove);

router.post("/approveStatusDocument", approveStatusDocument);
router.get("/waitingApproveList", waitingApproveList);

// User
router.get("/users", listUsers);
router.post("/editUser", editUserByAdmin);
router.post("/deleteUser", deleteUserByAdmin);

// Project
router.get("/listProject", listProject);
router.get("/checkProject/:name", checkProject);
router.post("/createProject", createProject);
router.post("/updateProject", updateProject);
router.delete("/deleteProject", deleteProject);

// Summary
router.post("/exportToExcel", exportToExcel);
// router.post("/excelTest", excelTest);

// Home

router.get("/searchDataIntoTable/:name", searchDataIntoTable);

module.exports = router;
