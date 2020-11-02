const button = document.querySelector(".url-area button");
const input = document.querySelector(".url-area input");

const firstScreen = document.querySelector('.first-screen');
const infos = document.querySelector('.infos');
const downloadArea = document.querySelector('.download-area');

button.addEventListener('click', searchURL);

function searchURL() {
    const url = input.value;

    // Pesquisa da URL...


    input.value = '';
}

function showMenus() {
    firstScreen.style.display = 'none';
    infos.style.display = 'flex';
    downloadArea.style.display = 'flex';
}

function hideMenus() {
    firstScreen.style.display = 'none';
    infos.style.display = 'flex';
    downloadArea.style.display = 'flex';
}