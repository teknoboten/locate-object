const fs = require("fs");
const path = require("path");
const csv = require('csv-parser');


function getItemDataMap(lines, i, vendor) {
  const vendorItemMaps = {
    universal: {
      GTIN: lines[i].trim(),
      "Item Name": lines[i + 1]?.trim(),
      Qty: lines[i + 2]?.trim(),
      "Unit Cost": lines[i + 3]?.trim(),
    },
      autruche: {
      'Item Name': lines[i].trim(),
      'Default Vendor Code': lines[i + 1]?.trim(),
      'Unit Cost': lines[i + 2]?.trim(),
      'Qty': lines[i + 3]?.trim()
    }
  }
  return vendorItemMaps[vendor] || {};
}

function parseTextFile(inputFilePath, outputFilePath, vendor) {
  const vendors = {
    universal: ["GTIN", "Item Name", "Qty", "Unit Cost"],
    autruche: [
      "Item Name",
      "Default Vendor Code",
      "Unit Cost",
      "Qty"
    ],
  };


  let textData = fs.readFileSync(inputFilePath, "utf-8");
  const lines = textData.replaceAll("\t", "\n").split("\n")
  const csvLines = [vendors[vendor].join(",")];

  for (let i = 0; i < lines.length; i += vendors[vendor].length + 1) {
    if (lines[i].trim()) {
      const itemDataMap = getItemDataMap(lines, i, vendor);
      const itemData = vendors[vendor].map(column => {
        if (column === 'Item Name') {
          // If the column is 'Item Name', surround the value with double quotes
          return `"${itemDataMap[column] || ''}"`;
        }
        if (column === 'Unit Cost') {
          return itemDataMap[column].replaceAll('$', '')
          
        }
        return itemDataMap[column] || '';
      })

      csvLines.push(itemData.join(","));

    }
  }
  fs.writeFile(outputFilePath, csvLines.join('\n'), 'utf8', (err) => {
    if (err) {
      console.error('Error writing the CSV file:', err);
    } else {
      console.log('CSV file written successfully.');
    }
  });

}

function arrayToCSV(data) {
  if (!data || data.length === 0) {
      console.error('Data is empty or undefined');
      return '';
  }

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

async function compareAndFilter() {
  poItems = await readCSV('output.csv');
  currentLibrary = await readCSV(`currentcat.csv`);

  const filteredGTINs = new Set(currentLibrary.map(item => item.GTIN));
  const newItems = poItems.filter(item => !filteredGTINs.has(item.GTIN));
  
  writeCSV('new_items.csv', newItems);

}


const inputFile = "data.txt";
const outputFile = "output.csv"

// parseTextFile(inputFile, outputFile, "autruche"); //universal data.txt does not find any existing items
// parseTextFile(inputFile, outputFile, "universal");
setTimeout(compareAndFilter, 2000)