const label = document.querySelector('.url-area label');
const input = document.getElementById('yt-url');

label.addEventListener('click', copyToInput);

function copyToInput() {
    document.execCommand('paste');
}