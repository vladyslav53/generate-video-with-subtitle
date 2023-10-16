/**Create a new file and import the necessary libraries for making an HTTP request. */
import axios, { AxiosError } from "axios";
import fs from "fs-extra";
import { isHttpPath, getBasenameWithoutExt } from "./utils.js";
import path from "path";

/**Set up the API endpoint and headers. The headers should include your API token. */
const baseUrl = "https://api.assemblyai.com/v2";

export const generateSubtitleFile = async function (videoPath, subtitlePath) {
    const headers = {
        authorization: process.env.ASSEMBLYAI_API_KEY,
    };

    let isHttp = isHttpPath(videoPath),
        uploadUrl;

    if (isHttp == false) {
        videoPath = path.resolve(videoPath);
        if (!fs.pathExistsSync(videoPath)) {
            console.log(videoPath + " doesn't exist.");
            return false;
        }
        const audioData = await fs.readFile(path.resolve(videoPath));
        const uploadResponse = await axios.post(
            `${baseUrl}/upload`,
            audioData,
            {
                headers,
            }
        );
        uploadUrl = uploadResponse.data.upload_url;
    } else uploadUrl = videoPath;

    /**Use the upload_url returned by the AssemblyAI API to create a JSON payload containing the audio_url parameter. */

    const data = {
        audio_url: uploadUrl,
    };

    /**Make a POST request to the AssemblyAI API endpoint with the payload and headers. */
    const url = `${baseUrl}/transcript`;
    const response = await axios.post(url, data, { headers: headers });

    /**After making the request, you'll receive an ID for the transcription. Use it to poll the API every few seconds to check the status of the transcript job. Once the status is completed, you can retrieve the transcript from the API response. */
    const transcriptId = response.data.id;
    const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`;

    while (true) {
        const pollingResponse = await axios.get(pollingEndpoint, {
            headers: headers,
        });
        const transcriptionResult = pollingResponse.data;

        if (transcriptionResult.status === "completed") {
            break;
        } else if (transcriptionResult.status === "error") {
            console.error(`Transcription failed: ${transcriptionResult.error}`);
            return false;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    /**Export your complete transcripts in SRT or VTT format, to be plugged into a video player for subtitles and closed captions.
    To get the subtitles, send a GET request to the /v2/transcript/:id/:subtitle_format endpoint. The format is either srt or vtt. */

    async function getSubtitleFile(transcriptId, fileFormat) {
        if (!["srt", "vtt"].includes(fileFormat)) {
            throw new Error(
                `Unsupported file format: ${fileFormat}. Please specify 'srt' or 'vtt'.`
            );
        }

        const url = `https://api.assemblyai.com/v2/transcript/${transcriptId}/${fileFormat}?chars_per_caption=55`;

        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            throw new Error(
                `Failed to retrieve ${fileFormat.toUpperCase()} file: ${
                    error.response?.status
                } ${error.response?.data?.error}`
            );
        }
    }

    try {
        const subtitles = await getSubtitleFile(
            transcriptId,
            process.env.SUBTITLE_EXT // or srt
        );

        await fs.writeFile(subtitlePath, subtitles);
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
};
