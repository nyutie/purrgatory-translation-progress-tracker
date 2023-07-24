importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js');

class ProgressCounterWorker {
  constructor() {
    // Listen for messages from the main thread
    self.onmessage = (event) => {
      const sheetsID = event.data;
      this.countProgressAndSendResult(sheetsID);
    };
  }

  // Function to fetch Google Sheets data using the export link
  fetchSheetsData(sheetsID) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsID}/export?format=xlsx`;

    return fetch(exportUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => new Uint8Array(data));
  }

  // Function to count progress in specific columns
  countProgress(sheetsData) {
    const progressCounts = {};

    const targetSheets = [
      'objects', 'inventory', 'receptionist', 'oliver and kyungsoon intro',
      'kyungsoon', 'oliver', 'ttt', 'numa', 'flowers', 'elijah',
      'slam', 'poems', 'sean', 'piano', 'tori', 'natalie',
      'ending', 'ending2', 'heaven'
    ];

    for (const sheetName of targetSheets) {
      const sheetData = sheetsData[sheetName];
      if (sheetData) {
        progressCounts[sheetName] = this.calculateProgress(sheetData);
      }
    }

    return progressCounts;
  }

  calculateProgress(sheetData) {
    let totalProgress = 0;

    for (const cellReference in sheetData) {
      if (cellReference.startsWith('D')) {
        const cellValue = sheetData[cellReference].v;
        if (cellValue !== '__pass') {
          const rowNumber = Number(cellReference.slice(1));
          const colEValue = sheetData[`E${rowNumber}`]?.v;
          if (colEValue) {
            totalProgress += colEValue;
          }
        }
      } else if (cellReference.startsWith('J')) {
        const cellValue = sheetData[cellReference].v;
        if (cellValue !== '__pass') {
          const rowNumber = Number(cellReference.slice(1));
          const colKValue = sheetData[`K${rowNumber}`]?.v;
          if (colKValue) {
            totalProgress += colKValue;
          }
        }
      }
    }

    return totalProgress;
  }

  // Function to count progress and send the result back to the main thread
  countProgressAndSendResult(sheetsID) {
    this.fetchSheetsData(sheetsID)
      .then((data) => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetsData = workbook.Sheets;

        const progressCounts = this.countProgress(sheetsData);

        // Post the progress counts back to the main thread
        self.postMessage(progressCounts);
      })
      .catch((error) => {
        console.error('Error fetching Google Sheets data:', error);
        // Send an error message back to the main thread
        self.postMessage({ error: 'Error fetching Google Sheets data. Please check the link and try again.' });
      });
  }
}

// Create a ProgressCounterWorker instance
const progressCounterWorker = new ProgressCounterWorker();