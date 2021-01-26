const cp = require("child_process");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-static");

class Downloader {
    constructor({ output, ref, config: { audio, video } }) {
        this.output = output;
        this.ref = ref;
        this.config = { audio, video };

        this.tracker = {
            audio: { downloaded: 0, total: 0 },
            video: { downloaded: 0, total: 0 },
        };

        this.isDownloading = false;
        this.onlyAudio = video.quality == null;

        this.progressId;

        this.eventTypes = Object.create(null);
        this.eventTypes.started = null;
        this.eventTypes.finished = null;
        this.eventTypes.data = null;
        this.eventTypes.canceled = null;
        this.eventTypes.error = err => {
            console.log('Error', err);
        }

        this.updateProgress = this.updateProgress.bind(this);
        this.downloadFinished = this.downloadFinished.bind(this);
        this.hasError = this.hasError.bind(this);
    }

    start() {
        this.isDownloading = true;
        this.getStreams();

        if (this.onlyAudio) {
            this.configureAudioStream();
            this.downloadOnlyAudio();
        } else {
            this.configureFFMpeg();
            this.downloadVideo();
        }

    }

    downloadOnlyAudio() {
        this.audio.pipe(fs.createWriteStream(this.output));
    }

    downloadVideo() {
        this.audio.pipe(this.ffmpegProcess.stdio[4]);
        this.video.pipe(this.ffmpegProcess.stdio[5]);
    }

    downloadFinished() {
        if (this.isDownloading) {
            clearInterval(this.progressId);

            this.isDownloading = false;
            this.dispatchEvent("finished");
        }
    }

    cancelDownload() {
        clearInterval(this.progressId);
        this.isDownloading = false;

        if (this.audio) {
            this.audio.destroy();
        }

        if (this.video) {
            this.ffmpegProcess.stdio[3].destroy();
            this.ffmpegProcess.stdio[4].destroy();
            this.ffmpegProcess.stdio[5].destroy();
            this.ffmpegProcess.kill("SIGKILL");
            this.video.destroy();
        }

        const thisId = setInterval(() => {
            if (this.ffmpegProcess.killed) {
                clearInterval(thisId);
                fs.unlinkSync(this.output);
            }
        }, 1000);

        this.dispatchEvent("canceled");
    }

    getStreams() {
        this.audio = ytdl(this.ref, this.config.audio)
            .on('progress', (_, downloaded, total) => {
                this.tracker.audio = { downloaded, total };
            })
            .on('error', this.hasError);

        if (!this.onlyAudio) {
            this.video = ytdl(this.ref, this.config.video)
                .on('progress', (_, downloaded, total) => {
                    this.tracker.video = { downloaded, total };
                })
                .on('error', this.hasError);
        }
    }

    updateProgress() {
        this.dispatchEvent("data", this.tracker);
    }

    configureAudioStream() {
        this.audio.on("response", () => this.configureProgress());
        this.audio.on("end", this.downloadFinished);
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

        this.ffmpegProcess.stdio[3].on("data", () => this.configureProgress(300));
        this.ffmpegProcess.on("close", this.downloadFinished);
    }

    configureProgress(interval = 300) {
        if (!this.progressId) {
            const progressInterval = Math.max(interval, 300);

            this.progressId =
                setInterval(this.updateProgress, progressInterval);

            this.dispatchEvent("started");
        }
    }

    hasError(error) {
        this.dispatchEvent("error", error);
    }

    on(type, handler) {
        if (typeof handler !== "function") {
            throw new TypeError("handler is not a function");
        }

        if (!(type in this.eventTypes)) {
            throw new TypeError(`"${type}" is not valid event`);
        }

        this.eventTypes[type] = handler;
    }

    dispatchEvent(type, ...args) {
        if (!(type in this.eventTypes)) {
            throw new TypeError(`"${type}" is not valid event`);
        }

        const event = this.eventTypes[type];
        if (event) {
            event.apply(null, args);
        }

    }

}

exports.default = Downloader;
