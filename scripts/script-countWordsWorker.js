importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js');

class WordCounterWorker {
  constructor() {
    // Listen for messages from the main thread
    self.onmessage = (event) => {
      const sheetsID = event.data;
      this.countWordsInSheetsAndSendResult(sheetsID);
    };
  }

  // Function to count words in a string
  countWordsInString(text) {
    return text.trim().split(/\s+/).filter((word) => word !== '').length;
  }

  // Function to count words in each sheet of Google Sheets
  countWordsInSheets(sheetsData) {
    const wordCounts = {};

    Object.keys(sheetsData).forEach((cellReference) => {
      const sheetName = cellReference.replace(/[^A-Za-z]/g, ''); // Extract sheet name from cell reference
      const cellValue = sheetsData[cellReference].v;

      if (cellValue) {
        wordCounts[sheetName] = (wordCounts[sheetName] || 0) + this.countWordsInString(cellValue);
      }
    });

    return wordCounts;
  }

  // Function to fetch Google Sheets data using the export link
  fetchSheetsData(sheetsID) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsID}/export?format=xlsx`;

    return fetch(exportUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => new Uint8Array(data));
  }

  // Function to count words and send the result back to the main thread
  countWordsInSheetsAndSendResult(sheetsID) {
    this.fetchSheetsData(sheetsID)
      .then((data) => {
        const workbook = XLSX.read(data, { type: 'array' });

        const wordCounts = {};

        workbook.SheetNames.forEach((sheetName) => {
          const sheetsData = workbook.Sheets[sheetName];
          const sheetWordCounts = this.countWordsInSheets(sheetsData);

          // Sum up word counts for each sheet
          wordCounts[sheetName] = Object.values(sheetWordCounts).reduce((acc, count) => acc + count, 0);
        });

        // Post the word counts back to the main thread
        self.postMessage(wordCounts);
      })
      .catch((error) => {
        console.error('Error fetching Google Sheets data:', error);
        // Send an error message back to the main thread
        self.postMessage({ error: 'Error fetching Google Sheets data. Please check the link and try again.' });
      });
  }
}

// Create a WordCounterWorker instance
const wordCounterWorker = new WordCounterWorker();