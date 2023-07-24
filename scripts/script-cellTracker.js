class CellTracker {
  constructor() {

  }

  getProgress() {
    this.cellCounterWorker = new Worker('scripts/script-cellTrackerWorker.js');

    const outputDiv = document.getElementById('outputCell');
    outputDiv.innerHTML = 'downloading sheet...';

    const sheetsLink = document.getElementById('sheetsLinkCell').value;
    const sheetsID = sheetsLink.match(/[-\w]{25,}/); // Extract the Google Sheets ID from the link

    // Run the cellCounter function in the separate Web Worker thread
    this.cellCounterWorker.onmessage = (event) => {
      const progressData = event.data;

      if (progressData.error) {
        outputDiv.innerHTML = "<br>" + progressData.error;
        return;
      }

      // Clear the output div
      outputDiv.innerHTML = '';

      // Display each sheet's progress
      for (const sheetName in progressData.sheetsProgress) {
        const sheetProgress = progressData.sheetsProgress[sheetName];
        outputDiv.innerHTML += `cells translated in '${sheetName}': ${sheetProgress}<br>`;
      }

      if (progressData.unknownSheets.length > 0) {
        outputDiv.innerHTML += `<br><br>unknown sheets: `;
        progressData.unknownSheets.forEach((sheetName) => {
          outputDiv.innerHTML += `'${sheetName}', `;
        })
        outputDiv.innerHTML = outputDiv.innerHTML.slice(0, -2); // Remove the trailing comma and space
        outputDiv.innerHTML += `<br><br>`;
      }

      outputDiv.innerHTML += `<br>total progress: ${progressData.totalProgress.toFixed(2)}%`;
    };

    // Send message to the worker to start processing
    this.cellCounterWorker.postMessage(sheetsID);
  }
}

export default CellTracker;