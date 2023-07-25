class Ui {
  constructor() {
    document.getElementById('link-input').addEventListener('input', this.sheetLinkInputHandler.bind(this));
    document.getElementById('file-upload-input').addEventListener('change', this.fileUploadHandler.bind(this));

    this.selectedSheet = { type: null, content: null };

    this.timeoutId = null;
  }
  
  changeProcessSheetButton(enable) {
    document.getElementById('process-sheet-button').disabled = !enable;
  }

  changeAllInputs(enable) {
    document.getElementById('link-input').disabled = !enable;
    document.getElementById('upload-button').disabled = !enable;
    document.getElementById('upload-clear-button').disabled = !enable;
    document.getElementById('process-sheet-button').disabled = !enable;
  }

  sheetLinkInputHandler(event) {
    this.changeProcessSheetButton(false);
    const linkInput = event.target;
    const sheetUrl = linkInput.value;
    clearTimeout(this.timeoutId); // Clear the previous timeout if it exists

    if (sheetUrl.trim() === '') {
      const sheetReady = document.getElementById('sheet-ready');
      sheetReady.classList.add('hidden');
      return;
    }

    this.timeoutId = setTimeout(() => {
      if (sheetUrl.includes('https://docs.google.com/spreadsheets/')) {
        const sheetReady = document.getElementById('sheet-ready');
        sheetReady.classList.remove('hidden');
        sheetReady.innerHTML = 'fetching sheet title...';
        getSheetTitle(sheetUrl)
          .then((title) => {
            sheetReady.innerHTML = `selected google sheet: '${title}'`;
            this.selectedSheet = {
              type: "link",
              content: sheetUrl
            };
            this.changeProcessSheetButton(true);
          })
          .catch((error) => {
            console.error('Error fetching sheet title:', error);
            sheetReady.innerHTML = 'error fetching sheet title! check the link and try again. the sheet has to be public!';
          });
      } else {
        const sheetReady = document.getElementById('sheet-ready');
        sheetReady.classList.remove('hidden');
        sheetReady.innerHTML = 'invalid link';
      }
    }, 100);

    async function getSheetTitle(sheetUrl) {
      const response = await fetch(sheetUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Sheets data.');
      }
      const html = await response.text();
      const titleRegex = /<title>(.*?)<\/title>/;
      const titleMatch = html.match(titleRegex);
      if (titleMatch && titleMatch[1]) {
        let title = titleMatch[1];
        
        // Find the last occurrence of " - " in the title
        const lastDashIndex = title.lastIndexOf(" - ");
        
        // Remove the last " - " and anything after it
        if (lastDashIndex !== -1) {
          title = title.slice(0, lastDashIndex);
        }
        
        return title;
      } else {
        throw new Error('Title not found in the fetched HTML.');
      }
    }
  }

  fileUploadHandler(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      // Extract the title from the file name
      const fileName = file.name;
      const title = fileName.substring(0, fileName.lastIndexOf('.'));

      // Update the display
      const sheetReady = document.getElementById('sheet-ready');
      sheetReady.classList.remove('hidden');
      sheetReady.innerHTML = `selected file: '${title}'`;

      // Disable the link input
      const linkInput = document.getElementById('link-input');
      linkInput.disabled = true;

      // Set the selectedSheet object to the file data
      this.selectedSheet = {
        type: 'file',
        content: file,
      };

      this.changeProcessSheetButton(true);
    }
  }

  // Clear button functionality
  clearFile() {
    this.changeProcessSheetButton(false);
    const sheetReady = document.getElementById('sheet-ready');
    sheetReady.classList.add('hidden');

    const linkInput = document.getElementById('link-input');
    linkInput.disabled = false;
    linkInput.value = '';
  }

  sendSheetToMain() {
    window.main.processSheet(this.selectedSheet)
  }


}

export default Ui;