const { dialog } = require('electron').remote;
const ytdl = require('ytdl-core');
const fs = require('fs');

const button = document.querySelector(".url-area button");
const urlInput = document.querySelector(".url-area input");
const closeBtn = document.getElementById("close-menus");
const status = document.querySelector('.download-status');

const firstScreen = document.querySelector('.first-screen');
const loading = document.querySelector('.loading');
const infos = document.querySelector('.infos');
const downloadArea = document.querySelector('.download-area');

const thumbnail = document.querySelector(".infos img");
const outputs = document.querySelectorAll(".info");
const select = document.querySelector(".download-area select");
const downloadBtn = document.querySelector('.download-area button');

let url;
let stream;

closeBtn.addEventListener('click', hideMenus)
button.addEventListener('click', searchURL);
downloadBtn.addEventListener('click', saveAs);

function searchURL() {
    hideMenus();
    firstScreen.style.display = 'none';
    loading.style.display = 'flex';
    url = urlInput.value || "https://www.youtube.com/watch?v=sbCA35RY4RA&list=RD7lTfFw0QgFY&index=23";

    if (ytdl.validateURL(url)) {

        const go = async () => {
            status.innerHTML = '<span class="success" >URL founded<span>';
            const details = (await ytdl.getBasicInfo(url)).videoDetails;

            thumbnail.src = details.thumbnail.thumbnails.pop().url;
            outputs[0].innerText = controlDisplayName(details.title);
            outputs[1].innerText = details.ownerChannelName;
            outputs[2].innerText = formatSeconds(details.lengthSeconds);

            loading.style.display = 'none';

            showMenus();
        }

        setTimeout(go, 2000);
    } else {
        status.innerHTML = '<span class="error" >Insert a valid URL<span>';
    }

    urlInput.value = '';
}

function saveAs() {
    dialog.showSaveDialog({
        title: 'Select the path to the file',
        defaultPath: `${process.env.USERPROFILE}/Downloads/${getFilename(outputs[0].innerText)}`,
        buttonLabel: 'Save',
        filters: [{ name: 'Media Files', extensions: ['mp4', 'webm', 'mp3'] }],
        properties: [],
    }).then(file => {
        if (!file.canceled) {
            download(file.filePath.toString());
        }
    }).catch(err => console.log(err));
}

function download(path) {
    ytdl(url, { quality: select.value })
        .pipe(fs.createWriteStream(path));
}

function getFilename(string) {
    let videoName = string.replace(/\s+/g, '-').replace(/([^\w-])+/g, "");
    const extension = select.value === 'highest' ? '.mp4' : '.mp3';
    return videoName + extension;
}

function controlDisplayName(string) {
    if (string.length > 90) {
        return string.substring(0, 90) + "...";
    }

    return string;
}

function formatSeconds(seconds) {
    const filingZero = number => number <= 9 ? `0${number}` : number;

    const minutes = Math.floor(seconds / 60);
    const restSeconds = (seconds - (60 * minutes))
    return minutes < 60 ? `${filingZero(minutes)}:${filingZero(restSeconds)}` : '1H+';
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