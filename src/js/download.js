const cp = require("child_process");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-static");

const { byteToMb } = require('./utils');
const handleError = require('./error-handler').default;

class Downloader {
    constructor({
        output,
        ref,
        audioConfig,
        videoConfig,
        statusElt,
        unlockDownload,
    }) {
        this.output = output;
        this.ref = ref;
        this.audioConfig = audioConfig;
        this.videoConfig = videoConfig;
        this.statusElt = statusElt;

        this.statusElt.innerHTML = this.getStatusProgressBarHTML();

        this.progressElt = this.statusElt.querySelector('progress');
        this.downloadedElt = this.statusElt.querySelector('.downloaded');
        this.totalElt = this.statusElt.querySelector('.total');

        this.unlockDownload = unlockDownload;

        this.tracker = {
            video: { downloaded: 0, total: 0 },
            audio: { downloaded: 0, total: 0 },
        };

        this.isDownloading = false;

        this.progressBarID;

        this.showProgress = this.showProgress.bind(this);
        this.downloadFinished = this.downloadFinished.bind(this);
        this.updateProgressBar = this.updateProgressBar.bind(this);
    }

    startVideo() {
        this.getStreams();
        this.configureFFMpeg();
        this.configProgressBar(300);
    }

    startAudio() {
        this.getStreams();
        this.downloadOnlyAudio();
        this.audio.on('end', this.downloadFinished);
        this.updateProgressBar(300)
    }

    downloadOnlyAudio() {
        this.audio.pipe(fs.createWriteStream(this.output));
    }

    showProgress() {
        const downloaded = this.tracker.audio.downloaded + this.tracker.video.downloaded;
        const total = this.tracker.audio.total + this.tracker.video.total;

        this.progressElt.max = total;
        this.progressElt.value = downloaded;

        this.totalElt.innerText = ` de ${byteToMb(total)}MB`;
        this.downloadedElt.innerText = byteToMb(downloaded) + "MB";
    }

    downloadFinished() {
        if ((this.ffmpegProcess && this.ffmpegProcess.exitCode === 0)
            || this.isDownloading) {

            this.isDownloading = false;
            clearInterval(this.progressBarID);
            this.statusElt.innerHTML =
                `
                <p class="progress-title success" >
                    Download finalizado!
                </p>
            `;

            setTimeout(() => this.statusElt.innerHTML = '', 3000);

            this.unlockDownload();
        }
    }

    configureFFMpeg() {
        this.ffmpegProcess = cp.spawn(ffmpeg, [
            // Remove ffmpeg's console spamming
            '-loglevel', '8', '-hide_banner',
            // Redirect/Enable progress messages
            '-progress', 'pipe:3',
            // Set inputs
            '-i', 'pipe:4',
            '-i', 'pipe:5',
            // Map audio & video from streams
            '-map', '0:a',
            '-map', '1:v',
            // Keep encoding
            '-c:v', 'copy',
            // Define output file
            this.output,
        ], {
            windowsHide: true,
            stdio: [
                /* Standard: stdin, stdout, stderr */
                'inherit', 'inherit', 'inherit',
                /* Custom: pipe:3, pipe:4, pipe:5 */
                'pipe', 'pipe', 'pipe',
            ],
        });

        this.audio.pipe(this.ffmpegProcess.stdio[4]);
        this.video.pipe(this.ffmpegProcess.stdio[5]);
    }

    updateProgressBar(interval = 1000) {
        const progressBarInterval = Math.max(interval, 300);

        this.progressBarID =
            setInterval(this.showProgress, progressBarInterval);
    }

    configProgressBar(interval) {
        this.ffmpegProcess.stdio[3].on('data', () => {
            if (!this.progressBarID) {
                this.updateProgressBar(interval);
            }
        });

        this.ffmpegProcess.on('close', this.downloadFinished);
    }

    getStreams() {
        this.isDownloading = true;

        this.audio = ytdl(this.ref, this.audioConfig)
            .on('progress', (_, downloaded, total) => {
                this.tracker.audio = { downloaded, total };
            })
            .on('error', handleError(this.statusElt));

        if (this.videoConfig) {
            this.video = ytdl(this.ref, this.videoConfig)
                .on('progress', (_, downloaded, total) => {
                    this.tracker.video = { downloaded, total };
                })
                .on('error', handleError(this.statusElt));
        }
    }

    getStatusProgressBarHTML() {
        return (
            `
                <button class="cancel">X</button>
                <p class="progress-title">Downloading...</ p>
                <progress class="progress" value="0" max="${Infinity}"></progress>
                <div class="size-of-download">
                    <span class="downloaded"></span>
                    <span class="total"></span>
                </div>
            `
        );
    }

}

exports.default = Downloader;
