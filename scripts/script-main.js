import WordCounter from "./script-countWords.js";
import CellTracker from "./script-cellTracker.js";

class Main {
  constructor() {
    this.wordCounter = new WordCounter();
    this.cellTracker = new CellTracker();
  }
}

window.main = new Main();