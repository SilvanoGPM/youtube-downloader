const { dialog } = require("electron").remote;
const ytdl = require("ytdl-core");
const fs = require('fs');

const {
    formatSeconds,
    eltDisplay,
    changeElementsDisplay,
    changeElementDisplay,
    controlDisplayName,
    getFilename,
    byteToMb,
    between,
    toQualityObject,
    byQualityValue,
} = require('./src/js/utils.js');

const Downloader = require('./src/js/download.js').default;
const handleError = require('./src/js/error-handler.js').default;

const $downloadingWrapper = document.querySelector(".downloading__wrapper");
const $loading = document.querySelector(".loading");

const $searchForm = document.querySelector(".lateral__group");
const $urlInput = document.querySelector("#video-url");

const $statusElt = document.querySelector(".download-status");
let $progressElt;
let $totalElt;
let $downloadedElt;

const $closeBtn = document.querySelector("#close-menus");
const $firstScreen = document.querySelector(".jumbotron");

const $infoElt = document.querySelector(".info");
const $thumbnailElt = $infoElt.querySelector("img");
const $titleOutput = $infoElt.querySelector('[data-output="title"]');
const $channelOutput = $infoElt.querySelector('[data-output="channel"]');
const $durationOutput = $infoElt.querySelector('[data-output="duration"]');

const $downloadArea = document.querySelector(".download-area");
const $selectTypeElt = $downloadArea.querySelector("#video-type");
const $selectQualityElt = $downloadArea.querySelector("#video-quality");
const $downloadBtn = $downloadArea.querySelector("button");

const qualities = {
    audio: [
        { label: '256K', quality: 'highestaudio' },
        { label: '128K', quality: 'lowestaudio' },
    ],
    video: null,
}

let url;
let lastestSearchId;
let isDownloading = false;

const showMenus = () => (
    changeElementsDisplay([
        eltDisplay($downloadingWrapper, "flex"),
        eltDisplay($loading)
    ])
);

const hideMenusAndShowFirstScreen = () => (
    changeElementsDisplay([
        eltDisplay($firstScreen, "flex"),
        eltDisplay($downloadingWrapper),
        eltDisplay($loading),
    ])
);

const showStatusMsg = (msg, cssClass = '', timeout) => {
    $statusElt.innerHTML = `<span class="${cssClass}" >${msg}</span>`;

    if (timeout) {
        setTimeout(() => $statusElt.innerHTML = '', timeout);
    }
}

const getAvailableQualities = (formats, filter) =>
    formats.filter(filter).map(toQualityObject).sort(byQualityValue);

const setVideoQualities = ({ formats }) => {
    qualities.video = getAvailableQualities(
        formats, ({ itag }) => between(itag, 133, 136)
    );
}

const renderQualities = (e = { target: { value: 'video' } }) => {
    const type = e.target.value;

    $selectQualityElt.innerHTML =
        qualities[type].map(({ label, quality }) =>
            `<option value=${quality} >${label}</option>`);
}

const setVideoInfo = async () => {
    lastestSearchId = setTimeout(showMenus, 2000);

    const basicInfo = await ytdl.getBasicInfo(url);
    setVideoQualities(basicInfo);
    renderQualities();

    const {
        title,
        ownerChannelName,
        lengthSeconds,
        thumbnails
    } = basicInfo.videoDetails;

    $thumbnailElt.src = thumbnails.pop().url;
    $thumbnailElt.title = title;

    $titleOutput.title = title;
    $channelOutput.title = ownerChannelName;

    $titleOutput.innerText = controlDisplayName(title, 80);
    $channelOutput.innerText = controlDisplayName(ownerChannelName, 30);
    $durationOutput.innerText = formatSeconds(lengthSeconds);
}

const searchURL = () => {
    clearTimeout(lastestSearchId);

    hideMenusAndShowFirstScreen();

    let msg = "Insira uma URL válida!";
    let msgClass = "error";

    if (ytdl.validateURL($urlInput.value)) {
        changeElementsDisplay([
            eltDisplay($firstScreen),
            eltDisplay($loading, 'flex'),
        ]);

        $selectTypeElt.value = "video";

        msg = "URL encontrada!";
        msgClass = "success";

        url = $urlInput.value;
        setVideoInfo();
    }

    showStatusMsg(msg, msgClass);
    $urlInput.value = '';
}

const unlockDownload = () => {
    $downloadBtn.addEventListener("click", saveAs);
    changeElementDisplay(eltDisplay($downloadArea, "flex"));
    isDownloading = false;
}

const cancelDownload = async downloader => {
    const option = await dialog.showMessageBox({
        title: "Cancelar Download",
        message: "Cancelar download?",
        type: "question",
        buttons: ["Não", "Sim"],
    })

    if (option.response === 1) {
        downloader.cancelDownload();

        showStatusMsg("Download cancelado!", "cancel-download", 3000);
        unlockDownload();
    }
}

const downloadStarted = downloader => {
    return () => {
        const cancelButton = $statusElt.querySelector('button.cancel');
        cancelButton.addEventListener('click', () => cancelDownload(downloader));
        isDownloading = true;
    }
}

const downloadFinished = () => {
    showStatusMsg("Download finalizado!", "progress-title success", 3000);
    unlockDownload();
}

const showProgress = ({ audio, video }) => {
    const downloaded = audio.downloaded + video.downloaded;
    const total = audio.total + video.total;

    $progressElt.max = total;
    $progressElt.value = downloaded;

    $totalElt.innerText = ` de ${byteToMb(total)}MB`;
    $downloadedElt.innerText = byteToMb(downloaded) + "MB";
}

const configDownloaderEvents = downloader => {
    downloader.on("started", downloadStarted(downloader));
    downloader.on("data", showProgress);
    downloader.on("finished", downloadFinished);
}

const setStatusProgressBarHTML = () => {
    $statusElt.innerHTML =
        `
            <button class="cancel">X</button>
            <p class="success">Downloading...</ p>
            <progress
                class="progress"
                value="0"
                max="${Infinity}">
            </progress>
            <div class="size-of-download">
                <span class="downloaded"></span>
                <span class="total"></span>
            </div>
        `
    $progressElt = $statusElt.querySelector('.progress');
    $downloadedElt = $statusElt.querySelector('.downloaded');
    $totalElt = $statusElt.querySelector('.total');
};

const getDownloaderConfig = path => {
    const mediaType = $selectTypeElt.value;
    const defaultAudio = qualities.audio[0].quality;

    const dowloaderConfig = {
        output: path,
        ref: url,
        config: {
            audio: { quality: defaultAudio },
            video: { quality: null },
        }
    };

    const quality = $selectQualityElt.value;
    dowloaderConfig.config[mediaType].quality = quality;

    return dowloaderConfig;
}

const download = path => {
    const downloader = new Downloader(getDownloaderConfig(path));
    downloader.start();

    setStatusProgressBarHTML();
    configDownloaderEvents(downloader);
}

const handleVideoDownload = ({ canceled, filePath }) => {
    if (!canceled) {
        const path = filePath.toString();
        if (fs.existsSync(path)) fs.unlinkSync(path);

        $downloadBtn.removeEventListener("click", saveAs);
        changeElementDisplay(eltDisplay($downloadArea));
        download(path);
    }
};

const saveAs = () => {
    const filename = getFilename($titleOutput.innerText, $selectTypeElt.value);
    const defaultPath = `${process.env.USERPROFILE}/Downloads/${filename}`;

    const options = {
        title: 'Selecione o caminho para o arquivo',
        defaultPath,
        buttonLabel: 'Salvar',
        filters: [{
            name: 'Media Files',
            extensions: ['mp4', 'webm', 'mp3']
        }],
        properties: [],
    }

    dialog.showSaveDialog(options)
        .then(handleVideoDownload)
        .catch(handleError($statusElt));
}

const handleSearchForm = evt => {
    evt.preventDefault();
    searchURL();
}

$selectTypeElt.addEventListener("change", renderQualities);
$searchForm.addEventListener("submit", handleSearchForm);
$downloadBtn.addEventListener("click", saveAs);
$closeBtn.addEventListener("click", hideMenusAndShowFirstScreen);
