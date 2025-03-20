const xlsx = require("xlsx");
const { getLogs } = require("./models");

const exportToExcel = (callback) => {
    getLogs((err, logs) => {
        const worksheet = xlsx.utils.json_to_sheet(logs);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Logs");

        const filePath = "logs.xlsx";
        xlsx.writeFile(workbook, filePath);
        callback(filePath);
    });
};

module.exports = { exportToExcel };
