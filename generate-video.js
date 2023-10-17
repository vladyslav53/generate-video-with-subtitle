import FFmpeg from "ffmpeg";

export const generateVideo = async function (
    videoPath,
    subtitlePath,
    resultPath
) {
    const video = await new FFmpeg(videoPath);
    video.addCommand(
        "-y -vf",
        `"subtitles='${subtitlePath}':force_style='FontName=Arial,FontSize=12,PrimaryColour=&H${process.env.PRIMARY_COLOUR},BackColour=&${process.env.BACKGROUND_COLOUR},Bold=1,Alignment=2,MarginV=40'"`
    );
    video.save(resultPath, (error, file) => {
        if (error) {
            console.error(error);
        } else {
            console.log("Video saved to", file);
        }
    });
};
