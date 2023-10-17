import fs from "fs";
import path from "path";
import "isomorphic-fetch"

const API_KEY = "c40a39355ce24125837acf90f76d42f6";
const VIDEO_FILE = path.resolve("./public/IMG_3013.mp4");
const TRANSCRIPT_FILE = "transcript.vtt";
const SUBTITLE_FILE = "subtitle.vtt";

async function transcribeVideo() {
    const formData = new FormData();
    formData.append("audio_url", fs.createReadStream(VIDEO_FILE));
    formData.append("auto_highlights", true);
    formData.append("speaker_labels", true);
    formData.append("language_model", "assemblyai");
    const response = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
    });
    const data = await response.json();
    console.log(data);
    return data.id;
}

async function getTranscript(transcriptionId) {
    const response = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
        {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        }
    );
    const data = await response.json();
    return data.text;
}

async function generateSubtitle(transcript) {
    const cues = transcript
        .split("\n\n")
        .filter((line) => !line.startsWith("WEBVTT"))
        .map((line) => {
            const [time, text] = line.split("\n").slice(1);
            const [start, end] = time.split(" --> ").map((t) => {
                const [hms, ms] = t.split(".");
                const [h, m, s] = hms.split(":");
                return (
                    parseInt(h) * 3600 +
                    parseInt(m) * 60 +
                    parseInt(s) +
                    parseInt(ms) / 1000
                );
            });
            return { start, end, text };
        });
    const subtitle = cues
        .map((cue, index) => {
            const { start, end, text } = cue;
            const style = `style="background-color: yellow; color: blue;"`;
            return `${index + 1}\n${formatTime(start)} --> ${formatTime(
                end
            )}\n<span ${style}>${text}</span>\n`;
        })
        .join("\n");
    const header = "WEBVTT\n\n";
    const content = header + subtitle;
    fs.writeFileSync(SUBTITLE_FILE, content);
}

function formatTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(
        milliseconds,
        3
    )}`;
}

function pad(number, length = 2) {
    return `${number}`.padStart(length, "0");
}

async function addSubtitleToVideo() {
    const video = new ffmpeg(VIDEO_FILE);
    video.addCommand(
        "-vf",
        `subtitles=${SUBTITLE_FILE}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H0000FF&,BackColour=&HFFFF00&,Bold=1'`
    );
    video.addCommand(
        "-vf",
        `drawbox=y=ih-50:color=yellow@0.5:width=iw:height=50:t=max`
    );
    return new Promise((resolve, reject) => {
        video.save("output.mp4", (error, file) => {
            if (error) {
                reject(error);
            } else {
                resolve(file);
            }
        });
    });
}

async function main() {
    const transcriptionId = await transcribeVideo();
    console.log(`Transcription ID: ${transcriptionId}`);
    const transcript = await getTranscript(transcriptionId);
    console.log(`Transcript: ${transcript}`);
    await generateSubtitle(transcript);
    console.log(`Subtitle generated: ${SUBTITLE_FILE}`);
    const outputFile = await addSubtitleToVideo();
    console.log(`Video saved to: ${outputFile}`);
}

main().catch((error) => {
    console.error(error);
});

console.log([5].join("a"));
