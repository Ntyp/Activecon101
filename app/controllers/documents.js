const db = require("../database/database");
const moment = require("moment");

exports.listDocuments = async (req, res) => {
  db.execute("SELECT * FROM documents", function (err, results, fields) {
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

exports.documentsSearch = async (req, res) => {
  db.execute(
    "SELECT * FROM documents order by id desc",
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

exports.checkDocument = async (req, res) => {
  const id = req.params["id"];
  console.log(id);
  db.execute(
    "SELECT * from documents d  inner join users u on u.id  = d.created_by  WHERE d.pr_number = ?",
    [id],
    function (err, results, fields) {
      if (err) {
        console.error(err);
        return res.json({
          status: "500",
          success: false,
          message: "Internal server error",
        });
      }
      db.execute(
        "SELECT * FROM documents_list  WHERE code_list = ?",
        [id],
        function (err, result, fields) {
          if (err) {
            console.error(err);
            return res.json({
              status: "500",
              success: false,
              message: "Internal server error",
            });
          }
          // const payload = {
          //   created_at: results[0].created_at,
          //   created_by: results[0].created_by,
          //   email: results[0].email,
          //   id: results[0].id,
          //   name: results[0].name,
          //   note: results[0].note,
          //   position: results[0].position,
          //   pr_number: results[0].pr_number,
          //   project: results[0].project,
          //   role: results[0].role,
          //   status: results[0].status,
          //   tel: results[0].tel,
          //   type_docs: results[0].type_docs
          // };
          if (result) {
            results.forEach((item) => {
              item.list = result;
            });
            // payload.list = results.list;
            res.json({ status: "200", data: results, success: true });
          } else {
            res.json({ status: "200", data: results, success: true });
          }
        }
      );
    }
  );
};

// สร้างเอกสารต้องมีการส้รางรายการใน table approve ด้วย
exports.createDocument = async (req, res) => {
  const data = req.body;
  const promises = [];

  if (data.case == "add") {
    const createDocumentTable = new Promise((resolve, reject) => {
      db.execute(
        "INSERT INTO documents(project,pr_number,type_docs,note,tel,status,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)",
        [
          data.project,
          data.prNumber,
          data.typeDocs,
          data.note,
          data.tel,
          "waiting",
          data.createdBy,
          moment().format("YYYY-MM-DD"),
        ],
        function (err, results, fields) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
    promises.push(createDocumentTable);

    if (data.list.length > 0) {
      data.list.forEach((item, index) => {
        const createListTable = new Promise((resolve, reject) => {
          db.execute(
            "INSERT INTO documents_list(name, code,code_list, list_order, date_used,type,size,brand,model,count,unit,place_buy,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              item.name,
              item.code,
              data.prNumber,
              index + 1,
              item.dateUsed,
              item.type,
              item.size,
              item.brand,
              item.model,
              item.count,
              item.unit,
              item.placeBuy,
              data.createdBy,
              moment().format("YYYY-MM-DD"),
            ],
            function (err, results, fields) {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            }
          );
        });
        promises.push(createListTable);
      });
    }

    const createApproveTable = new Promise((resolve, reject) => {
      db.execute(
        "INSERT INTO approve_documents(code) VALUES (?)",
        [data.prNumber],
        function (err, results, fields) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
    promises.push(createApproveTable);
    try {
      await Promise.all(promises);
      res.json({ status: "200", success: true });
    } catch (error) {
      res
        .status(400)
        .json({ status: "400", message: error.message, success: false });
    }
  } else if (data.case == "edit") {
    const updateDocumentTable = new Promise((resolve, reject) => {
      db.execute(
        "UPDATE documents SET  project = ?, pr_number = ?, type_docs = ?, note = ?, tel = ?, updated_by = ?, updated_at = ? WHERE code = ?",
        [
          data.project,
          data.prNumber,
          data.typeDocs,
          data.note,
          data.tel,
          data.createdBy,
          moment().format("YYYY-MM-DD"),
          id,
        ],
        function (err, results, fields) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
    promises.push(updateDocumentTable);

    if (data.list.length > 0) {
      data.list.forEach((item, index) => {
        const updateListTable = new Promise((resolve, reject) => {
          db.execute(
            "UPDATE documents_list SET name=?, code=?, , date_used=?, type=?, size=?, brand=?, model=?, count=?, unit=?, place_buy=?,  updated_by=?, updated_at=? WHERE code_list=? AND  list_order=? ",
            [
              item.name,
              item.code,
              item.dateUsed,
              item.type,
              item.size,
              item.brand,
              item.model,
              item.count,
              item.unit,
              item.placeBuy,
              data.createdBy,
              moment().format("YYYY-MM-DD"),
              data.prNumber,
              index + 1,
            ],
            function (err, results, fields) {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            }
          );
        });
        promises.push(updateListTable);
      });
    }
    try {
      await Promise.all(promises);
      res.json({ status: "200", success: true });
    } catch (error) {
      res
        .status(400)
        .json({ status: "400", message: error.message, success: false });
    }
  }
};

exports.deleteDocuments = async (req, res) => {
  const data = req.body;
  console.log(data);
  const promises = [];

  const deleteDocumentTable = new Promise((resolve, reject) => {
    db.execute(
      "DELETE FROM documents WHERE pr_number = ?",
      [data.pr_number],
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(deleteDocumentTable);

  const deleteDocumentListTable = new Promise((resolve, reject) => {
    db.execute(
      "DELETE FROM documents_list WHERE code_list = ?",
      [data.pr_number],
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(deleteDocumentListTable);

  const deleteApproveTable = new Promise((resolve, reject) => {
    db.execute(
      "DELETE FROM approve_documents WHERE code = ?",
      [data.pr_number],
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(deleteApproveTable);

  try {
    await Promise.all(promises);
    res.json({ status: "200", success: true });
  } catch (error) {
    res
      .status(400)
      .json({ status: "400", message: error.message, success: false });
  }
};

exports.exportHistory = async (req, res) => {
  const data = req.body;
  db.execute(
    "SELECT * FROM documents WHERE date_start BETWEEN ? AND ? AND type = ?",
    [data.date_start, data.date_end, data.type],
    function (err, results, fields) {
      // Export
    }
  );
};

// การเบิก,การเพิ่ม,การคืน,การลด

exports.listSummaryBoard = async (req, res) => {
  const data = req.body;
  const id = data.id;
  const caseAdd = "เบิกของ";
  const caseEdit = "คืนของ";
  const caseChangeStatus = "เปลี่ยนสถานะ";
  const caseDeleteStatus = "ลบของ";
  const promises = [];

  const countAddDocumentTable = new Promise((resolve, reject) => {
    db.execute(
      "SELECT COUNT(id) as count_add FROM documents WHERE type = ?",
      caseAdd,
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(countAddDocumentTable);

  const countEditDocumentTable = new Promise((resolve, reject) => {
    db.execute(
      "SELECT COUNT(id) as count_edit FROM documents WHERE type = ?",
      caseEdit,
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(countEditDocumentTable);

  const countChangeDocumentTable = new Promise((resolve, reject) => {
    db.execute(
      "SELECT COUNT(id) as count_change_status FROM documents WHERE type = ?",
      caseChangeStatus,
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(createDocumentTable);

  const countDeleteDocumentTable = new Promise((resolve, reject) => {
    db.execute(
      "SELECT COUNT(id) as count_delete FROM documents WHERE type = ?",
      caseDeleteStatus,
      function (err, results, fields) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
  promises.push(countDeleteDocumentTable);

  try {
    await Promise.all(promises);
    res.json({ status: "200", success: true });
  } catch (error) {
    res
      .status(400)
      .json({ status: "400", message: error.message, success: false });
  }
};

exports.countByType = async (req, res) => {
  const type = req.params["type"];
  db.query(
    "SELECT COUNT(id) as count FROM documents WHERE type_docs = ? AND status = ?",
    [type, "approve"],
    function (err, results) {
      if (err) {
        return res.json({ status: "400", message: err });
      }
      return res.json({ status: "200", data: results, success: true });
    }
  );
};

// exports.approve = async (req, res) => {
//   const data = req.body;
//   const promises = [];
//   const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

//   const updateApprovetTable = new Promise((resolve, reject) => {
//     db.execute(
//       "UPDATE approve_documents SET status = ?, approve_by = ?, created_by = ?, created_at = ? WHERE code = ?",
//       [
//         "approve",
//         data.user,
//         data.user,
//         moment().format("YYYY-MM-DD HH:mm:ss"),
//         data.code,
//       ],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       }
//     );
//   });
//   promises.push(updateApprovetTable);

//   const updateStatusApprovetTable = new Promise((resolve, reject) => {
//     db.execute(
//       "UPDATE documents SET status = ? WHERE pr_number = ?",
//       ["approve", data.code],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       }
//     );
//   });
//   promises.push(updateStatusApprovetTable);

//   db.execute(
//     "SELECT * FROM documents_ist WHERE code_list = ?",
//     [data.code],
//     function (err, results, fields) {
//       if (err) {
//         console.error(err);
//         return res.json({
//           status: "500",
//           success: false,
//           message: "Internal server error",
//         });
//       }

//       results.forEach((item) => {
//         db.execute(
//           "SELECT * FROM product WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//           [item.name, item.brand, item.model, item.size],
//           function (err, results, fields) {
//             if (err) {
//               reject(err);
//               return;
//             }
//             if (results.length > 0) {
//               // ต้องเช็คก้อนว่าค่าปัจจุบันเป็นเท่าไหร่
//               // SELECT * FROM documents d  inner join documents_list dl  on d.pr_number  = dl.code_list  where dl.name = 'ac' and dl.brand  = '0' and dl.model = '0'  and dl.size = '0' and d.status  = 'approve'
//               db.execute(
//                 "SELECT * FROM documents d  inner join documents_list dl  on d.pr_number  = dl.code_list  where dl.name = ? and dl.brand  = ? and dl.model = ?  and dl.size = ? and d.status  = ?",
//                 [name, brand, size, model, "approve"],
//                 function (err, results, fields) {
//                   if (err) {
//                     console.error(err);
//                     return res.json({
//                       status: "500",
//                       success: false,
//                       message: "Internal server error",
//                     });
//                   }
//                   if (results.typeDocs == "เบิกของ") {
//                     let newValue = results.count - item.count;
//                   } else if (results.typeDocs == "เพิ่มของ") {
//                     let newValue = results.count - item.count;
//                   } else if (results.typeDocs == "ลบชอง") {
//                     let newValue = results.count - item.count;
//                   } else if (results.typeDocs == "เปลี่ยนสถานะ") {
//                     let newValue = results.count - item.count;
//                   }
//                 }
//               );
//               // if (results.typeDocs == "เบิกของ") {
//               // } else if (results.typeDocs == "เพิ่มของ") {
//               // } else if (results.typeDocs == "ลบชอง") {
//               // } else if (results.typeDocs == "เปลี่ยนสถานะ") {
//               // }

//               // เพิ่ม +
//               // ลบ -
//               // เบิก -
//               // เปลี่ยนสถานะ - แล้วก็อาจจะมา+

//               // ต้องเช็คว่าเอกสารที่นำมาเป็น + หรือ -
//               db.execute(
//                 "UPDATE product SET name = ?, brand = ?, size = ?, model = ?, count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                 [
//                   data.name,
//                   data.brand,
//                   data.size,
//                   data.model,
//                   data.count,
//                   data.user,
//                   currentTime,
//                   data.name,
//                   data.brand,
//                   data.model,
//                   data.size,
//                 ],
//                 (err, results, fields) => {
//                   if (err) {
//                     return res.json({ status: "400", message: err });
//                   }
//                   callback();
//                 }
//               );
//             } else {
//               db.execute(
//                 "INSERT INTO product (name, brand, size, model, count, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
//                 [
//                   data.name,
//                   data.brand,
//                   data.size,
//                   data.model,
//                   data.count,
//                   data.user,
//                   currentTime,
//                 ],
//                 (err, results, fields) => {
//                   if (err) {
//                     return res.json({ status: "400", message: err });
//                   }
//                   callback();
//                 }
//               );
//             }
//             // resolve();
//           }
//         );
//       });
//       // res.json({ status: "200", data: results, success: true });
//     }
//   );
//   // array.forEach(element => {

//   // });

//   const selectCheckSameDataInTable = new Promise((resolve, reject) => {
//     db.execute(
//       "SELECT * FROM product WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//       [data.name, data.brand, data.model, data.size],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         if (results.length > 0) {
//           // ต้องเช็คก้อนว่าค่าปัจจุบันเป็นเท่าไหร่
//           // SELECT * FROM documents d  inner join documents_list dl  on d.pr_number  = dl.code_list  where dl.name = 'ac' and dl.brand  = '0' and dl.model = '0'  and dl.size = '0' and d.status  = 'approve'

//           if (results.typeDocs == "เบิกของ") {
//           } else if (results.typeDocs == "เพิ่มของ") {
//           } else if (results.typeDocs == "ลบชอง") {
//           } else if (results.typeDocs == "เปลี่ยนสถานะ") {
//           }

//           // เพิ่ม +
//           // ลบ -
//           // เบิก -
//           // เปลี่ยนสถานะ - แล้วก็อาจจะมา+

//           // ต้องเช็คว่าเอกสารที่นำมาเป็น + หรือ -
//           db.execute(
//             "UPDATE product SET name = ?, brand = ?, size = ?, model = ?, count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//             [
//               data.name,
//               data.brand,
//               data.size,
//               data.model,
//               data.count,
//               data.user,
//               currentTime,
//               data.name,
//               data.brand,
//               data.model,
//               data.size,
//             ],
//             (err, results, fields) => {
//               if (err) {
//                 return res.json({ status: "400", message: err });
//               }
//               callback();
//             }
//           );
//         } else {
//           db.execute(
//             "INSERT INTO product (name, brand, size, model, count, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
//             [
//               data.name,
//               data.brand,
//               data.size,
//               data.model,
//               data.count,
//               data.user,
//               currentTime,
//             ],
//             (err, results, fields) => {
//               if (err) {
//                 return res.json({ status: "400", message: err });
//               }
//               callback();
//             }
//           );
//         }
//         // resolve();
//       }
//     );
//   });
//   promises.push(selectCheckSameDataInTable);
// };

// db.execute(
//   "UPDATE approve_documents SET status = ?, approve_by = ?, created_by = ?, created_at = ? WHERE code = ?",
//   [
//     "approve",
//     data.user,
//     data.user,
//     moment().format("YYYY-MM-DD HH:mm:ss"),
//     data.code,
//   ],
//   function (err, results) {
//     if (err) {
//       return res.json({ status: "400", message: err });
//     }
//     db.execute(
//       "UPDATE documents SET status = ? WHERE pr_number = ?",
//       ["approve", data.code],
//       function (err, results) {
//         if (err) {
//           return res.json({ status: "400", message: err });
//         }
//         // Insert data to product
//         return res.json({ status: "200", success: true });
//       }
//     );
//   }
// );

// type_docs
// exports.approveNew = async (req, res) => {
//   const data = req.body;
//   // db.execute(
//   //   "UPDATE approve_documents SET status = ?, approve_by = ?, created_by = ?, created_at = ? WHERE code = ?",
//   //   [
//   //     "disapprove",
//   //     data.user,
//   //     data.user,
//   //     moment().format("YYYY-MM-DD HH:mm:ss"),
//   //     data.code,
//   //   ],
//   //   function (err, results) {
//   //     if (err) {
//   //       return res.json({ status: "400", message: err });
//   //     }
//   //     db.execute(
//   //       "UPDATE documents SET status = ? WHERE pr_number = ?",
//   //       ["disapprove", data.code],
//   //       function (err, results) {
//   //         if (err) {
//   //           return res.json({ status: "400", message: err });
//   //         }
//   //         return res.json({ status: "200", success: true });
//   //       }
//   //     );
//   //   }
//   // );

//   // pr_number
//   db.execute(
//     "SELECT * FROM document_list WHERE code_list = ?",
//     [data.pr_number],
//     function (err, results) {
//       if (err) {
//         return res.json({ status: "400", message: err });
//       }
//       results.forEach((item) => {
//         db.execute(
//           "SELECT * FROM product WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//           [item.name, item.brand, item.model, item.size],
//           function (err, result) {
//             if (err) {
//               return res.json({ status: "400", message: err });
//             }
//             if (result.length != 0) {
//               // มี
//               if (data.typeDocs == "เบิกของ") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "คืนของ") {
//                 let newValue = (result.count += item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "เพิ่มของ") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "ลบชอง") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "เปลี่ยนสถานะ") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               }
//             } else {
//               db.execute(
//                 "INSERT INTO product (name, brand, size, model, count, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
//                 [
//                   data.name,
//                   data.brand,
//                   data.size,
//                   data.model,
//                   data.count,
//                   data.user,
//                   currentTime,
//                 ],
//                 (err, results, fields) => {
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve();
//                 }
//               );
//             }
//           }
//         );
//       });
//       // return res.json({ status: "200", success: true });
//     }
//   );
// };

// exports.approve1 = async (req, res) => {
//   const data = req.body;
//   const promises = [];
//   const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

//   const updateApprovetTable = new Promise((resolve, reject) => {
//     db.execute(
//       "UPDATE approve_documents SET status = ?, approve_by = ?, created_by = ?, created_at = ? WHERE code = ?",
//       [
//         "disapprove",
//         data.user,
//         data.user,
//         moment().format("YYYY-MM-DD HH:mm:ss"),
//         data.code,
//       ],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       }
//     );
//   });
//   promises.push(updateApprovetTable);

//   const updateStatusApprovetTable = new Promise((resolve, reject) => {
//     db.execute(
//       "UPDATE documents SET status = ? WHERE pr_number = ?",
//       ["approve", data.code],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       }
//     );
//   });
//   promises.push(updateStatusApprovetTable);

//   db.execute(
//     "SELECT * FROM document_list WHERE code_list = ?",
//     [data.pr_number],
//     function (err, results) {
//       if (err) {
//         return res.json({ status: "400", message: err });
//       }
//       results.forEach((item) => {
//         db.execute(
//           "SELECT * FROM product WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//           [item.name, item.brand, item.model, item.size],
//           function (err, result) {
//             if (err) {
//               return res.json({ status: "400", message: err });
//             }
//             if (result.length != 0) {
//               // มี
//               if (data.typeDocs == "เบิกของ") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "คืนของ") {
//                 let newValue = (result.count += item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "เพิ่มของ") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "ลบชอง") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               } else if (data.typeDocs == "เปลี่ยนสถานะ") {
//                 let newValue = (result.count -= item.count);
//                 db.execute(
//                   "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
//                   [
//                     newValue,
//                     data.user,
//                     currentTime,
//                     data.name,
//                     data.brand,
//                     data.model,
//                     data.size,
//                   ],
//                   (err, results, fields) => {
//                     if (err) {
//                       reject(err);
//                       return;
//                     }
//                     resolve();
//                   }
//                 );
//               }
//             } else {
//               db.execute(
//                 "INSERT INTO product (name, brand, size, model, count, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
//                 [
//                   data.name,
//                   data.brand,
//                   data.size,
//                   data.model,
//                   data.count,
//                   data.user,
//                   currentTime,
//                 ],
//                 (err, results, fields) => {
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve();
//                 }
//               );
//             }
//           }
//         );
//       });
//       return res.json({ status: "200", success: true });
//     }
//   );
// };

exports.approve = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

    // Promisified function for updating approve_documents table
    const updateApproveTable = () =>
      new Promise((resolve, reject) => {
        db.execute(
          "UPDATE approve_documents SET status = ?, approve_by = ?, created_by = ?, created_at = ? WHERE code = ?",
          ["approve", data.user, data.user, currentTime, data.code],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });

    // Promisified function for updating documents table
    const updateStatusTable = () =>
      new Promise((resolve, reject) => {
        db.execute(
          "UPDATE documents SET status = ? WHERE pr_number = ?",
          ["approve", data.code],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });

    const documentList = await new Promise((resolve, reject) => {
      db.execute(
        "SELECT * FROM documents_list WHERE code_list = ?",
        [data.code],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    const productPromises = documentList.map((item) => {
      return new Promise(async (resolve, reject) => {
        const result = await new Promise((innerResolve, innerReject) => {
          db.execute(
            "SELECT * FROM product WHERE name = ? AND brand = ? AND model = ? AND size = ?",
            [item.name, item.brand, item.model, item.size],
            (err, result) => {
              if (err) {
                innerReject(err);
              } else {
                innerResolve(result);
              }
            }
          );
        });

        let newValue;
        if (result.length !== 0) {
          if (data.typeDocs == "คืนของ" || data.typeDocs == "เพิ่มของ") {
            newValue = result[0].count + item.count;
            console.log(newValue);
          } else {
            newValue = result[0].count - item.count;
            console.log(newValue);
          }

          await new Promise((innerResolve, innerReject) => {
            db.execute(
              "UPDATE product SET count = ?, updated_by = ?, updated_at = ? WHERE name = ? AND brand = ? AND model = ? AND size = ?",
              [
                newValue,
                data.user,
                currentTime,
                item.name,
                item.brand,
                item.model,
                item.size,
              ],
              (err) => {
                if (err) {
                  innerReject(err);
                } else {
                  innerResolve();
                }
              }
            );
          });
        } else {
          await new Promise((innerResolve, innerReject) => {
            db.execute(
              "INSERT INTO product (name, brand, size, model, count, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                item.name,
                item.brand,
                item.size,
                item.model,
                item.count,
                data.user,
                currentTime,
              ],
              (err) => {
                if (err) {
                  innerReject(err);
                } else {
                  innerResolve();
                }
              }
            );
          });
        }
        resolve();
      });
    });

    // Wait for all productPromises to complete
    await Promise.all(productPromises);

    // Execute both update promises
    await Promise.all([updateApproveTable(), updateStatusTable()]);

    res.json({ status: "200", success: true });
  } catch (error) {
    res.json({ status: "400", message: error.message });
  }
};

exports.disapprove = async (req, res) => {
  const data = req.body;
  db.execute(
    "UPDATE approve_documents SET status = ?, approve_by = ?, created_by = ?, created_at = ? WHERE code = ?",
    [
      "disapprove",
      data.user,
      data.user,
      moment().format("YYYY-MM-DD HH:mm:ss"),
      data.code,
    ],
    function (err, results) {
      if (err) {
        return res.json({ status: "400", message: err });
      }
      db.execute(
        "UPDATE documents SET status = ? WHERE pr_number = ?",
        ["disapprove", data.code],
        function (err, results) {
          if (err) {
            return res.json({ status: "400", message: err });
          }
          return res.json({ status: "200", success: true });
        }
      );
    }
  );
};

exports.searchData = async (req, res) => {
  const type = req.params["type"];
  db.query(
    "SELECT COUNT(id) as count FROM documents WHERE type_docs = ? AND status = ?",
    [type, "approve"],
    function (err, results) {
      if (err) {
        return res.json({ status: "400", message: err });
      }
      return res.json({ status: "200", data: results, success: true });
    }
  );
};

exports.searchDataIntoTable = async (req, res) => {
  const name = req.params["name"];
  db.query(
    "SELECT * FROM product WHERE name = ?",
    [name],
    function (err, results) {
      if (err) {
        return res.json({ status: "400", message: err });
      }
      return res.json({ status: "200", data: results, success: true });
    }
  );
};
