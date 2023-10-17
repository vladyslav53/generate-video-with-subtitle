import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { mkdirp } from "mkdirp";
import { getBasenameWithoutExt } from "./utils.js";
import { generateSubtitleFile } from "./transcribe-video.js";
import { generateVideo } from "./generate-video.js";
import { refactorSubtitle } from "./refactor-subtitle.js";
// import {
//     addSubtitleAndSaveVideoWithSubtitles,
//     startVLCWithCustomPort,
// } from "./vlc.js";

async function generateVideoWithSubtitle(videoPath) {
    /**Make necessary folders */
    mkdirp.sync(process.env.SUBTITLE_FOLDER);
    mkdirp.sync(process.env.OUTPUT_FOLDER);

    let subtitlePath = path
        .join(
            process.env.SUBTITLE_FOLDER,
            `${getBasenameWithoutExt(videoPath)}.${process.env.SUBTITLE_EXT}`
        )
        .replace("\\", "/");
    let resultPath = path
        .join(
            process.env.OUTPUT_FOLDER,
            `${getBasenameWithoutExt(videoPath)}.mp4`
        )
        .replace("\\", "/");
    let [subtitleGenerated, payload] = await generateSubtitleFile(
        videoPath,
        subtitlePath
    );

    if (subtitleGenerated == false) return false;
    console.log("subtitle Generated");

    let refactored = refactorSubtitle(subtitlePath, payload);
    if (refactored == false) return false;
    console.log("subtitle Refactored");

    // let port = 8081,
    //     vlcProcess = startVLCWithCustomPort(port);
    // await addSubtitleAndSaveVideoWithSubtitles(
    //     videoPath,
    //     subtitlePath,
    //     resultPath,
    //     port
    // );

    // setTimeout(() => {
    //     vlcProcess.kill();
    //     console.log("VLC terminated");
    // }, 10000);

    await generateVideo(videoPath, subtitlePath, resultPath);
    console.log("video Generated");
}

generateVideoWithSubtitle("./public/test1.mp4");

// generateVideo("./public/IMG_3013.mp4", "./subtitle/IMG_3013.vtt", "./output/result.mp4")
