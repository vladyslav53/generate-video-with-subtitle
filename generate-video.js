import fs from "fs-extra";
import FFmpeg from "ffmpeg";

const analyzeSubtitle = async function (subtitlePath) {
    const transcript = fs.readFileSync(subtitlePath, "utf-8");
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
};

export const generateVideo = async function (
    videoPath,
    subtitlePath,
    resultPath
) {
    const video = await new FFmpeg(videoPath);
    console.log("AAA");
    video.addCommand(
        "-vf",
        `"subtitles='${subtitlePath}':force_style='FontName=Arial,FontSize=12,PrimaryColour=&H${process.env.PRIMARY_COLOUR},BackColour=&${process.env.BACKGROUND_COLOUR},Bold=1,Alignment=2,MarginV=40'"`
    );
    console.log("CCC");
    video.save(resultPath, (error, file) => {
        if (error) {
            console.error(error);
        } else {
            console.log("Video saved to", file);
        }
    });
};
