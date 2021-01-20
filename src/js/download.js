const { dialog } = require("electron").remote;
const {
  formatSeconds,
  byteToMb,
  elementDisplay,
  changeElementsDisplay,
  controlDisplayName,
  getFilename,
} = require(__dirname + "/src/js/utils.js");

const ytdl = require("ytdl-core");
const fs = require("fs");

const loading = document.querySelector(".loading");

const searchForm = document.querySelector(".url-group");
const urlInput = document.querySelector(".url-area input");

const status = document.querySelector(".download-status");
let progressElt;
let downloadedElt;

const closeBtn = document.getElementById("close-menus");
const firstScreen = document.querySelector(".first-screen");

const infosElt = document.querySelector(".infos");
const thumbnailElt = infosElt.querySelector("img");
const titleOutput = infosElt.querySelector('[data-output="title"]');
const channelOutput = infosElt.querySelector('[data-output="channel"]');
const durationOutput = infosElt.querySelector('[data-output="duration"]');

const downloadArea = document.querySelector(".download-area");
const selectElt = downloadArea.querySelector("select");
const downloadBtn = downloadArea.querySelector("button");

let url;
let stream;
let lastestSearchID;
let isDownloading = false;

const showMenus = () =>
  changeElementsDisplay([
    elementDisplay(closeBtn, "inline-block"),
    elementDisplay(infosElt, "flex"),
    elementDisplay(downloadArea, "flex"),
    elementDisplay(loading),
  ]);

const hideMenus = () =>
  changeElementsDisplay([
    elementDisplay(firstScreen, "flex"),
    elementDisplay(closeBtn),
    elementDisplay(infosElt),
    elementDisplay(downloadArea),
    elementDisplay(loading),
  ]);

const displayVideoInfo = async () => {
  const basicInfo = await ytdl.getBasicInfo(url);
  const {
    title,
    ownerChannelName,
    lengthSeconds,
    thumbnail: images,
  } = basicInfo.videoDetails;

  const thumbnailURL = images.thumbnails.pop().url;
  thumbnailElt.src = thumbnailURL;

  titleOutput.innerText = controlDisplayName(title);
  channelOutput.innerText = controlDisplayName(ownerChannelName);
  durationOutput.innerText = formatSeconds(lengthSeconds);

  showMenus();
};

const searchURL = () => {
  hideMenus();
  clearTimeout(lastestSearchID);
  status.innerHTML = "";

  if (ytdl.validateURL(urlInput.value)) {
    url = urlInput.value;
    changeElementsDisplay([
      elementDisplay(firstScreen),
      elementDisplay(loading, "flex"),
    ]);

    status.innerHTML = '<span class="success" >URL found<span>';
    lastestSearchID = setTimeout(displayVideoInfo, 2000);
  } else {
    status.innerHTML = `
        <span class="error" >Insert a valid URL<span>
        `;
  }

  urlInput.value = "";
};

const handleError = (err) => {
  if (!fs.existsSync(`${__dirname}\\logs`)) {
    fs.mkdirSync(`${__dirname}\\logs`);
  }
  const logsPath = `${__dirname}\\logs\\error-log-${Date.now()}.txt`;
  fs.writeFileSync(logsPath, err);
  status.innerHTML = `
    <span class="error" >Ocorred an error, try again<span>`;
};

const unlockDownload = () => {
  downloadBtn.parentElement.style.cursor = "default";
  downloadBtn.style.pointerEvents = "all";
  isDownloading = false;
};

const cancelDownload = async (path) => {
  const option = await dialog.showMessageBox({
    title: "Cancel Download",
    message: "Cancel download?",
    type: "question",
    buttons: ["Yes", "No"],
  });

  if (option.response === 0) {
    isDownloading = false;
    status.innerHTML = `
            <span class="cancel-download" >Download canceled!<span>
        `;
    setTimeout(() => (status.innerHTML = ""), 1000);

    await stream.destroy();
    fs.unlinkSync(path);

    unlockDownload();
  }
};

const initialDownloadSetup = (path) => (res) => {
  if (isDownloading) {
    const max = parseInt(res.headers["content-length"], 10);

    status.innerHTML = `
        <button class="cancel">X</button>
        <p class="progress-title">Downloading...</ p>
        <progress class="progress" value="0" max="${max}"></progress>
        <div class="size-of-download">
            <span class="downloaded" ></span><span> of <span>${byteToMb(
              max
            )}Mb</span>
        </div>
    `;

    const cancelButton = status.querySelector("button.cancel");
    cancelButton.addEventListener("click", () => cancelDownload(path));

    downloadedElt = status.querySelector(".downloaded");
    progressElt = status.querySelector("progress");
  }
};

const updateSize = (data) => {
  if (isDownloading) {
    progressElt.value += data.length;
    downloadedElt.innerText = byteToMb(progressElt.value) + "Mb";
  }
};

const downloadComplete = () => {
  if (isDownloading) {
    status.innerHTML = '<p class="progress-title success" >Downloaded!</p>';
    unlockDownload();
  }
};

function download(path) {
  isDownloading = true;

  const options = {
    quality: selectElt.value,
  };

  stream = ytdl(url, options)
    .on("response", initialDownloadSetup(path))
    .on("data", updateSize)
    .on("finish", downloadComplete)
    .on("error", (err) => {
      handleError(err);
      unlockDownload();
    })
    .pipe(fs.createWriteStream(path));
}

const handleVideoDownload = (file) => {
  if (!file.canceled) {
    downloadBtn.parentElement.style.cursor = "not-allowed";
    downloadBtn.style.pointerEvents = "none";
    download(file.filePath.toString());
  }
};

const saveAs = () => {
  const filename = getFilename(titleOutput.innerText, selectElt.value);
  const defaultPath = `${process.env.USERPROFILE}/Downloads/${filename}`;

  const options = {
    title: "Select the path to the file",
    defaultPath,
    buttonLabel: "Save",
    filters: [
      {
        name: "Media Files",
        extensions: ["mp4", "webm", "mp3"],
      },
    ],
    properties: [],
  };

  dialog.showSaveDialog(options).then(handleVideoDownload).catch(handleError);
};

const handleSearchForm = (evt) => {
  evt.preventDefault();
  searchURL();
};

searchForm.addEventListener("submit", handleSearchForm);
downloadBtn.addEventListener("click", saveAs);
closeBtn.addEventListener("click", hideMenus);
