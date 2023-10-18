# Transcribe video and hardcode subtitle into the video

This repository is the project which transcribes the video, stylizes the subtitle, and hardcode subtitle into the video.

__Developer plan__ will be needed to install node.js.

## Setup

1. Create a Node.js environment using your preferred version.

2. Copy the environment variables from `example.env` to a new file named `.env`. Modify the values in the `.env` file to match your desired configuration. The variables to set are:

3. Install the required dependencies by running the following command:

```bash
npm install
```

## Usage

### Running the app

1. Prepare the video and get the path to it, e.g. `./public/test1.mp4`
2. Go to `index.js` and rename the path part to your video path.

```javascript
generateVideoWithSubtitle("./public/test1.mp4");
```

### Result

The subtitle is saved to `process.env.SUBTITLE_FOLDER` folder in the source repository.
The output video with hardcoded subtitle is saved to `process.env.OUTPUT_FOLDER` folder in the source repository.

I wish this would help you. Good luck!!!😊😊😊