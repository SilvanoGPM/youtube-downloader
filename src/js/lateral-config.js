const label = document.querySelector('.url-area label');
const input = document.getElementById('yt-url');

const copyToInput = () => {
    input.value = '';
    document.execCommand('paste');
}

label.addEventListener('click', copyToInput);