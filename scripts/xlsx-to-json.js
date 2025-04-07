#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Check if required arguments are provided
if (process.argv.length < 4) {
  console.error('Usage: node xlsx-to-json.js <input-xlsx-file> <output-json-file>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

// Validate input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file "${inputFile}" does not exist.`);
  process.exit(1);
}

// Validate input file is an Excel file
const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
const fileExtension = path.extname(inputFile).toLowerCase();
if (!validExtensions.includes(fileExtension)) {
  console.error(`Error: Input file "${inputFile}" is not an Excel file.`);
  console.error(`Valid extensions: ${validExtensions.join(', ')}`);
  process.exit(1);
}

try {
  // Read the Excel file
  const workbook = xlsx.readFile(inputFile);
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const results = xlsx.utils.sheet_to_json(worksheet);
  
  // Write the JSON file
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  console.log(`Sheet used: ${sheetName}`);
  console.log(`Total records: ${results.length}`);
} catch (error) {
  console.error('Error processing Excel file:', error.message);
  process.exit(1);
}
