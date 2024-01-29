const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');


function textToCSV(inputFilePath, outputFilePath, templateColumns) {
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return;
      }
  
      // Split the file into lines
      const lines = data.split('\n');
  
      // Initialize an array to hold the CSV lines
      const csvLines = [templateColumns.join(',')]; // Use the template columns as the header
  
      // Process each set of lines as a single item
      for (let i = 0; i < lines.length; i += 5) {
        if (lines[i].trim()) {  // Check if the line is not empty
          // Create a map of values from the data
          const itemDataMap = {
            'GTIN': lines[i].trim(),
            'Item Name': lines[i + 1]?.trim(),
            'Qty': lines[i + 2]?.trim(),
            'Unit Cost': lines[i + 3]?.trim()
            // Add more fields here if they are available in the data
          };
  
          // Generate the CSV line based on the template columns
          const itemData = templateColumns.map(column => itemDataMap[column] || '');
  
          // Combine the item data into a single CSV line
          csvLines.push(itemData.join(','));
        }
      }
  
      // Join all lines with a newline character to form the CSV content
      const csvContent = csvLines.join('\n');
  
      // Write the CSV content to a new file
      fs.writeFile(outputFilePath, csvContent, 'utf8', err => {
        if (err) {
          console.error('Error writing the CSV file:', err);
        } else {
          console.log('CSV file was created successfully:', outputFilePath);
        }
      });
    });
  }

  // Function to read a CSV file and return its data
  function readCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }
  
  // Helper function to convert an array of objects to a CSV string
  function arrayToCSV(data) {
      const csvRows = [];
      // Get the headers
      const headers = Object.keys(data[0]);
      csvRows.push(headers.join(','));
  
      // Loop over the rows
      for (const row of data) {
          const values = headers.map(header => {
              const escaped = ('' + row[header]).replace(/"/g, '\\"'); // handle quotes in data
              return `"${escaped}"`; // wrap values in quotes
          });
          csvRows.push(values.join(','));
      }
  
      return csvRows.join('\n');
  }
  
  // Function to write an array of objects to a CSV file
  function writeCSV(filename, data) {
      const csvData = arrayToCSV(data);
      fs.writeFile(filename, csvData, err => {
          if (err) {
              console.error('Error writing CSV file', err);
          } else {
              console.log(`${filename} written successfully.`);
          }
      });
  }



//Create a CSV from a text file 
const templateColumns = ['Item Name', 'Variation Name', 'SKU', 'GTIN', 'Vendor Code', 'Notes', 'Qty', 'Unit Cost'];
textToCSV('data.txt', 'output.csv', templateColumns);

let poItems = [];
let currentLibrary = [];


// Find items missing from the current catalogue
//TO DO: update the output to match library template!
async function compareAndFilter() {
  poItems = await readCSV('output.csv');
  currentLibrary = await readCSV(`currentcat.csv`);

  // Assuming the GTIN is in a column named 'GTIN'
  const filteredGTINs = new Set(currentLibrary.map(item => item.GTIN));

  const newItems = poItems.filter(item => !filteredGTINs.has(item.GTIN));
//   const commonItems = poItems.filter(item => filteredGTINs.has(item.GTIN));

// Write these arrays to new CSV files
  writeCSV('new_items.csv', newItems);

}

setTimeout(compareAndFilter, 4000)