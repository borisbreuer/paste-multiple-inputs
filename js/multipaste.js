class Multipaste{
  constructor(className){
    this.className = className;
    this.inputElements = document.querySelectorAll(`.${this.className}`);
    this.inputElementsArr;
    this.startElement;
    this.startIndex;
    this.confirmPrompt;

    this.registerElements();
  }

  /* Copy & Paste Example
    7  
    5    
    74
    4   
    4 
    8     
    4 
    9  
    3 
    3   
  */

  paste = async (e) => {
    e.preventDefault();
    if(this.confirmPrompt) return

    let confirm;
    let rest = 0;
    let pasteData = this.getClipboardData(e);

    console.log(this.inputElementsArr.length - pasteData.length, this.startIndex + pasteData.length);

    if(this.startIndex + pasteData.length > this.inputElementsArr.length){
      rest = this.startIndex + pasteData.length - this.inputElementsArr.length;
      alert(`you are trying ${pasteData.length} items from position ${this.startIndex + 1}`);
    }

    let calculatedPasteLength = (pasteData.length - 1) + this.startIndex - rest

    for(let i = this.startIndex; i <= calculatedPasteLength; i++){
      this.inputElementsArr[i].classList.add("ready-to-paste");
    }

    try{
      confirm = await this.confirm('Press the key [y], [Enter] or [Return] to proceed. Press the key [n] to abort.')
    } catch(err){
      console.error(err);
    }

    if(confirm){
      let pasteindex = 0;
      for(let i = this.startIndex; i <= calculatedPasteLength; i++){
        if(pasteData[pasteindex] != "") this.inputElementsArr[i].value = pasteData[pasteindex];
        pasteindex++;
      }
    }

    this.inputElementsArr.forEach(el => el.classList.remove("ready-to-paste"));
  }

  startPaste = (e) => {
    if(this.target) this.target.removeEventListener('paste', this.paste);

    this.startElement = e.target;
    this.startIndex = this.inputElementsArr.indexOf(this.startElement);

    this.target = this.inputElementsArr[this.startIndex];
    this.target.addEventListener('paste', this.paste);
  }

  getClipboardData(e){
    return (e.clipboardData || window.clipboardData)
      .getData('text')
      .replace(/^(\r\n)+/, "")
      .replace(/^(\n)+/, "")
      .replace(/(\r\n)+$/, "")
      .replace(/(\n)+$/, "")
      .split('\n')
      .map(v => parseInt(v.trim()).toString());
  }
  
  registerElements(){
    this.inputElementsArr = [...this.inputElements]
    for(let el of this.inputElementsArr){
      el.addEventListener("focus", this.startPaste);
    }
  }

  createConfirmPrompt(message){
    this.confirmPrompt = document.createElement('div');
    this.confirmPrompt.textContent = message;
    this.confirmPrompt.className = 'confirm-prompt';
    document.body.appendChild(this.confirmPrompt)
  }

  removeConfirmPrompt(){
    document.body.removeChild(this.confirmPrompt)
    this.confirmPrompt = ''
  }

  confirmPromiseFn = (resolve, reject) => {
    const getKey = (e) => {
      e.preventDefault();
      if(e.key == 'y' || e.key == 'Y' || e.key == 'Enter') resolve(true)
      else if(e.key == 'n' || e.key == 'N') resolve(false)
      else reject(new Error('Used wrong key.'))

      this.removeConfirmPrompt()
      document.removeEventListener('keypress', getKey)
    }
    
    document.addEventListener('keypress', getKey)
  }

  async confirm(message){
    this.createConfirmPrompt(message);
    return new Promise(this.confirmPromiseFn);
  }
}