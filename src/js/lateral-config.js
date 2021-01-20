const label = document.querySelector('.lateral__area label');
const input = document.querySelector('#video-url');

const copyToInput = () => {
    input.value = '';
    input.focus();
    document.execCommand('paste');
}

label.addEventListener('click', copyToInput);
