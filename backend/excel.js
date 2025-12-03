const XLSX = require("xlsx");
const fs = require("fs");

const FILE_PATH = "./aeronica-data.xlsx";

function writeToExcel(data) {
    let workbook;
    let worksheet;

    // If file exists, load it
    if (fs.existsSync(FILE_PATH)) {
        workbook = XLSX.readFile(FILE_PATH);
        worksheet = workbook.Sheets["Submissions"];
    } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    }

    // Convert existing worksheet to JSON
    let sheetData = XLSX.utils.sheet_to_json(worksheet);

    // Add timestamp
    data.Timestamp = new Date().toLocaleString();

    // Push new row
    sheetData.push(data);

    // Convert JSON back to sheet
    const newWorksheet = XLSX.utils.json_to_sheet(sheetData);
    workbook.Sheets["Submissions"] = newWorksheet;

    // Write to file
    XLSX.writeFile(workbook, FILE_PATH);
}

module.exports = writeToExcel;
