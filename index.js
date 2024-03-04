const fs = require("fs");
const path = require("path");

//create a CSV from a text file
//parse text input format based on vendor


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

const inputFile = "data.txt";
const outputFile = "output.csv"
// parseTextFile(inputFile, outputFile, "autruche");

// const universal = 'GTIN,Item Name,Qty,Unit Cost'
// const autruche = 'Item Name,Default Vendor Code,Unit Price,Qty,Total'

const headers = () => { Object.keys(getItemDataMap[vendorItemMaps][universal])
}

console.log(headers)