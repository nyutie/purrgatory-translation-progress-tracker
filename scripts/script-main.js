import 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';

import Ui from './script-ui.js';
import WordCounter from './script-countWords.js';
import CellTracker from './script-cellTracker.js';

class Main {
  constructor() {
    this.ui = new Ui();
    this.wordCounter = new WordCounter();
    this.cellTracker = new CellTracker();
    
    this.originalSheetReadyText = '';

    this.finishedProcessing = { 'wordCount': null, 'cellProgress': null };
  }

  checkIfFinishedProcessing() {
    if (
      this.finishedProcessing.wordCount === true &&
      this.finishedProcessing.cellProgress === true
      ) {
        this.ui.blockAllInputs(false);
    }
  }

  finishedProcessingWordCount() {
    this.finishedProcessing.wordCount = true;
    this.checkIfFinishedProcessing();
  }

  finishedProcessingCellProgress() {
    this.finishedProcessing.cellProgress = true;
    this.checkIfFinishedProcessing();
  }

  resetSheetReadyText() {
    document.getElementById('sheet-ready').innerHTML = this.originalSheetReadyText;
  }

  async fetchSheetsData(sheetsID) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsID}/export?format=xlsx`;

    return fetch(exportUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => new Uint8Array(data));
  }

  processSheet(sheetInput) {
    this.originalSheetReadyText = document.getElementById('sheet-ready').innerHTML;
    this.finishedProcessing = { 'wordCount': false, 'cellProgress': false };

    this.ui.blockAllInputs(true);

    if (sheetInput.type === 'link') {
      document.getElementById('sheet-ready').innerHTML = 'downloading sheet...';
      const sheetsID = sheetInput.content.match(/[-\w]{25,}/);
      this.fetchSheetsData(sheetsID).then((data) => {
        this.wordCounter.countWords({ type: 'googlesheets', content: data });
        this.cellTracker.getProgress({ type: 'googlesheets', content: data });
      });
    } else if (sheetInput.type === 'file') {
      document.getElementById('sheet-ready').innerHTML = 'converting sheet...';
      const file = sheetInput.content;
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        this.wordCounter.countWords({ type: 'file', content: data });
        this.cellTracker.getProgress({ type: 'file', content: data });
      };
      reader.readAsArrayBuffer(file);
    } 
  }
}

window.main = new Main();