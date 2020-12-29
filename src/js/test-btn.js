const button = document.querySelector(".url-area button");
const urlInput = document.querySelector(".url-area input");
const closeBtn = document.getElementById("close-menus");

const firstScreen = document.querySelector('.first-screen');
const loading = document.querySelector('.loading');
const infos = document.querySelector('.infos');
const downloadArea = document.querySelector('.download-area');

closeBtn.addEventListener('click', hideMenus)
button.addEventListener('click', searchURL);

function searchURL() {
    hideMenus();
    const url = input.value;
    firstScreen.style.display = 'none';
    loading.style.display = 'block';

    setTimeout(() => {
        // Pesquisa da URL...
        showMenus();
        input.value = '';

        loading.style.display = 'none';
    }, 3000);

}

function showMenus() {
    closeBtn.style.display = 'inline-block'
    infos.style.display = 'flex';
    downloadArea.style.display = 'flex';
}

function hideMenus() {
    firstScreen.style.display = 'flex';
    closeBtn.style.display = 'none'
    infos.style.display = 'none';
    downloadArea.style.display = 'none';
}
