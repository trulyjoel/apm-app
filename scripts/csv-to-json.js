#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Check if required arguments are provided
if (process.argv.length < 4) {
  console.error('Usage: node csv-to-json.js <input-csv-file> <output-json-file>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

// Validate input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file "${inputFile}" does not exist.`);
  process.exit(1);
}

// Validate input file is a CSV
if (path.extname(inputFile).toLowerCase() !== '.csv') {
  console.error(`Error: Input file "${inputFile}" is not a CSV file.`);
  process.exit(1);
}

const results = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    try {
      // Write the JSON file
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
      console.log(`Successfully converted ${inputFile} to ${outputFile}`);
      console.log(`Total records: ${results.length}`);
    } catch (error) {
      console.error('Error writing JSON file:', error.message);
      process.exit(1);
    }
  })
  .on('error', (error) => {
    console.error('Error parsing CSV:', error.message);
    process.exit(1);
  });
