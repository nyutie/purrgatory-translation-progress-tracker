import WordCounter from "/scripts/script-countWords.js";

class Main {
  constructor() {
    this.wordCounter = new WordCounter();
  }
}

// Create a SheetDataAnalyzer instance
window.main = new Main();