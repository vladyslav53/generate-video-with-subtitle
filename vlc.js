import { exec } from "child_process";
import VLC from "vlc-client";

// Function to start VLC with the HTTP interface and custom port
export function startVLCWithCustomPort(port) {
    const vlcCommand = `vlc --extraintf=http --http-port=${port} --http-password=abcdef`;
    const vlcProcess = exec(vlcCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting VLC: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`VLC stderr: ${stderr}`);
            return;
        }
        console.log(`VLC started on port ${port}`);
    });
    // Terminate VLC after 10 seconds
    return vlcProcess
}

export async function addSubtitleAndSaveVideoWithSubtitles(
    inputVideoPath,
    subtitlePath,
    outputVideoPath,
    port
) {
    const vlc = new VLC.Client({ ip: "localhost", port, password: "abcdef" });
    // Load the input video
    await vlc.add(inputVideoPath);
    // Load the subtitle
    await vlc.setSubtitleFile(subtitlePath);
    // Enable the subtitle
    await vlc.setSubtitleTrack(1);
    // Save the video with hardcoded subtitles
    await vlc.record(outputVideoPath);
    // Close the VLC client
    await vlc.close();
}
