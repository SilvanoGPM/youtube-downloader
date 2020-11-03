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
let isDownloading = false;

closeBtn.addEventListener('click', hideMenus)
button.addEventListener('click', searchURL);
urlInput.addEventListener('keydown', evt => {
    if (evt.code === 'Enter') searchURL();
});
downloadBtn.addEventListener('click', saveAs);

function searchURL() {
    status.innerHTML = "";
    hideMenus();
    url = urlInput.value;
    if (ytdl.validateURL(url)) {
        firstScreen.style.display = 'none';
        loading.style.display = 'flex';

        const go = async () => {
            status.innerHTML = '<span class="success" >URL found<span>';
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
            downloadBtn.parentElement.style.cursor = 'not-allowed';
            downloadBtn.style.pointerEvents = 'none';
            download(file.filePath.toString());
        }
    }).catch(err => {
        console.log(err);
        status.innerHTML = '<span class="error" >Ocorred an error, try again<span>';
    });
}

let progress;
let downloaded;
function download(path) {
    stream = ytdl(url, { quality: select.value })
        .on('response', res => {
            isDownloading = true;
            const max = parseInt(res.headers['content-length'], 10);

            status.innerHTML = `<button class="cancel" onclick="cancelDownload()">X</button><p class="progress-title" >Downloading...</p><progress value="0" max="${max}" ></progress><div class="size-of-download" ><span class="downloaded" ></span><span> of <span>${byteToMb(max)}Mb</span></div>`;

            downloaded = status.querySelector('.downloaded');
            progress = status.querySelector("progress");
        })
        .on('data', data => {
            progress.value += data.length;
            downloaded.innerText = byteToMb(progress.value) + 'Mb';
        })
        .on('finish', () => {
            status.innerHTML = '<p class="progress-title success" >Downloaded!</p>';
            unlockDownload();
        })
        .on('error', err => {
            status.innerHTML = '<span class="error" >Ocorred an error, try again<span>';
            unlockDownload();
        })
        .pipe(fs.createWriteStream(path));
}

async function cancelDownload() {
    const option = await dialog.showMessageBox({
        title: "Cancel Download",
        message: "Cancel download?",
        type: "question",
        buttons: ["Yes", "No"],
    })

    if (option.response === 0) {
        await stream.destroy();
        status.innerHTML = "";
        setTimeout(() => status.innerHTML = "", 3000);
        unlockDownload();
    }
}

function unlockDownload() {
    downloadBtn.parentElement.style.cursor = 'default';
    downloadBtn.style.pointerEvents = 'all';
    isDownloading = false;
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

function byteToMb(bytes) {
    return ((bytes / 1024) / 1024).toFixed(2);
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