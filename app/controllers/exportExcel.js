const db = require("../database/database");
const moment = require("moment");
const Excel = require("exceljs");
const fs = require("fs");
const path = require("path");

// exports.exportToExcel = async (req, res) => {
//   const data = req.body;
//   const promises = [];

// //   {
// //     "dateStart": "2023-10-13",
// //     "dateEnd": "2023-10-12",
// //     "withdraw": true,
// //     "add": true,
// //     "back": true,
// //     "remove": true,
// //     "change": true
// // }

//   const dataInTable = new Promise((resolve, reject) => {
//     db.execute(
//       "select * from documents d where d.status  = ? AND created_at between ? AND ?",
//       ["approve",data.dateStart,data.dateEnd],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       }
//     );
//   });
//   promises.push(dataInTable);
// };

// exports.exportToExcel1 = async (req, res) => {
//   const data = req.body;
//   const promises = [];

//   // Define the base query
//   let sqlQuery =
//     "SELECT * FROM documents d WHERE d.status = 'approve' AND created_at BETWEEN ? AND ?";

//   // Create an array to store conditions for the WHERE clause
//   const conditions = [];

//   if (data.withdraw) {
//     conditions.push("type_docs = 'เบิกของ'");
//   }
//   if (data.add) {
//     conditions.push("type_docs = 'เพิ่มของ'");
//   }
//   if (data.back) {
//     conditions.push("type_docs = 'คืนของ'");
//   }
//   if (data.remove) {
//     conditions.push("type_docs = 'ลบของ'");
//   }
//   if (data.change) {
//     conditions.push("type_docs = 'เปลี่ยนสถานะ'");
//   }

//   // Add the conditions to the query if there are any
//   if (conditions.length > 0) {
//     sqlQuery += ` AND (${conditions.join(" OR ")})`;
//   }

//   console.log("sqlQuery", sqlQuery);
//   // Create a promise for the SQL query
//   const dataInTable = new Promise((resolve, reject) => {
//     db.execute(
//       sqlQuery,
//       [data.dateStart, data.dateEnd],
//       function (err, results, fields) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         // Resolve with the results
//         resolve(results);
//       }
//     );
//   });

//   promises.push(dataInTable);
//   try {
//     const [queryResults] = await Promise.all(promises);

//     const workbook = new Excel.Workbook();
//     const worksheet = workbook.addWorksheet("Sheet1");
//     const headers = [
//       { header: "ลำดับ", key: "index", width: 10 },
//       { header: "โครงการ", key: "project", width: 20 },
//       { header: "หมายเลข PR", key: "pr_number", width: 20 },
//       { header: "ประเภท", key: "type_docs", width: 15 },
//       { header: "ผู้จัดทำ", key: "created_at", width: 20 },
//       { header: "เบอร์ติดต่อ", key: "tel", width: 15 },
//       { header: "โน้ต", key: "note", width: 15 },
//       { header: "สถานะ", key: "status", width: 15 },
//       { header: "วันที่สร้างเอกสาร", key: "created_at", width: 20 },
//     ];

//     // Add the column headers to the worksheet
//     worksheet.columns = headers;

//     // Add data rows
//     queryResults.forEach((item, index) => {
//       const rowData = {
//         index: index + 1,
//         project: item.project,
//         pr_number: item.pr_number,
//         type_docs: item.type_docs,
//         created_at: item.created_at,
//         tel: item.tel,
//         note: item.note,
//         status: item.status,
//         created_at: item.created_at,
//       };
//       worksheet.addRow(rowData);
//     });

//     const timestamp = new Date().toISOString().replace(/:/g, "-");
//     const filename = `exported_data_${timestamp}.xlsx`;

//     // Save the workbook to a file
//     workbook.xlsx
//       .writeFile(filename)
//       .then(() => {
//         console.log("Excel file created:", filename);
//         // Send the Excel file as a response
//         res.download(filename, (err) => {
//           if (err) {
//             console.error("Error sending Excel file:", err);
//           }
//           // Delete the generated file after it's sent
//           fs.unlink(filename, (deleteErr) => {
//             if (deleteErr) {
//               console.error("Error deleting the generated file:", deleteErr);
//             }
//           });
//         });
//       })
//       .catch((error) => {
//         console.error("Error creating Excel file:", error);
//         res.status(500).json({
//           status: "500",
//           message: "Error creating Excel file",
//           success: false,
//         });
//       });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ status: "400", message: error.message, success: false });
//   }
// };

exports.exportToExcel = async (req, res) => {
  try {
    const data = req.body;
    const promises = [];

    // Define the base query
    let sqlQuery =
      "SELECT * FROM documents d WHERE d.status = 'approve' AND created_at BETWEEN ? AND ?";

    // Create an array to store conditions for the WHERE clause
    const conditions = [];

    if (data.withdraw) {
      conditions.push("type_docs = 'เบิกของ'");
    }
    if (data.add) {
      conditions.push("type_docs = 'เพิ่มของ'");
    }
    if (data.back) {
      conditions.push("type_docs = 'คืนของ'");
    }
    if (data.remove) {
      conditions.push("type_docs = 'ลบของ'");
    }
    if (data.change) {
      conditions.push("type_docs = 'เปลี่ยนสถานะ'");
    }

    // Add the conditions to the query if there are any
    if (conditions.length > 0) {
      sqlQuery += ` AND (${conditions.join(" OR ")})`;
    }

    // Create a promise for the SQL query
    const dataInTable = new Promise((resolve, reject) => {
      db.execute(
        sqlQuery,
        [data.dateStart, data.dateEnd],
        function (err, results, fields) {
          if (err) {
            reject(err);
            return;
          }
          // Resolve with the results
          resolve(results);
        }
      );
    });

    promises.push(dataInTable);

    const [queryResults] = await Promise.all(promises);
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    worksheet.columns = [
      { header: "ลำดับ", key: "index", width: 10 },
      { header: "โครงการ", key: "project", width: 20 },
      { header: "หมายเลข PR", key: "pr_number", width: 20 },
      { header: "ประเภท", key: "type_docs", width: 15 },
    //   { header: "ผู้จัดทำ", key: "created_at", width: 20 },
      { header: "เบอร์ติดต่อ", key: "tel", width: 15 },
      { header: "โน้ต", key: "note", width: 15 },
      { header: "สถานะ", key: "status", width: 15 },
      { header: "วันที่สร้างเอกสาร", key: "created_at", width: 20 },
    ];

    queryResults.forEach((item, index) => {
        const rowData = {
          index: index + 1,
          project: item.project,
          pr_number: item.pr_number,
          type_docs: item.type_docs,
        //   created_at: item.created_at,
          tel: item.tel,
          note: item.note,
          status: item.status,
          created_at: item.created_at,
        };
        worksheet.addRow(rowData);
      });

    // Add data to the Excel worksheet here

    // Send the Excel file to the client
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=example.xlsx");
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel file", error);
    res.status(500).send("Error generating Excel file");
  }
};
