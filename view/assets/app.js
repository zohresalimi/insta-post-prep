async function paste(e) {
    e.preventDefault();
    const processBtn = document.querySelector('.button-wrapper button');
    var pasteText = document.querySelector(".url-input");
    const text = await navigator.clipboard.readText();
    pasteText.textContent = text;
    if (pasteText.textContent) {
        processBtn.disabled = false;
    }

    console.log(text);
}
const pasteBtn = document.querySelector('#paste-btn');

async function readFromClipboard() {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText) {
        pasteBtn.style.display = "block"
    } else {
        pasteBtn.style.display = "none"
    }
}

setInterval(readFromClipboard, 1000)
pasteBtn.addEventListener('click', paste);