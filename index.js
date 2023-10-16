import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { mkdirp } from "mkdirp";
import { getBasenameWithoutExt } from "./utils.js";
import { generateSubtitleFile } from "./transcribe-video.js";
import { generateVideo } from "./generate-video.js";

async function generateVideoWithSubtitle(videoPath) {
    /**Make necessary folders */
    mkdirp.sync(process.env.SUBTITLE_FOLDER);
    mkdirp.sync(process.env.OUTPUT_FOLDER);

    let subtitlePath = path.resolve(
        path.join(
            process.env.SUBTITLE_FOLDER,
            `${getBasenameWithoutExt(videoPath)}.${process.env.SUBTITLE_EXT}`
        )
    );
    let resultPath = path.resolve(
        path.join(
            process.env.OUTPUT_FOLDER,
            `${getBasenameWithoutExt(videoPath)}.mp4`
        )
    );
    let subtitleGenerated = await generateSubtitleFile(videoPath, subtitlePath);
    if (subtitleGenerated == false) return false;
    console.log("subtitle Generated");
    await generateVideo(videoPath, subtitlePath, resultPath);
    console.log("video Generated");
}

// generateVideoWithSubtitle("./public/IMG_3013.mp4");

generateVideo("./public/IMG_3013.mp4", "./subtitle/IMG_3013.vtt", "./output/result.mp4")
