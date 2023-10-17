import fs from "fs-extra";
import secondsToTime from "vtt-creator/src/secondsToTime.js";
import webvtt2ass from "webvtt2ass";

function VTT() {
    var counter = 0;
    var content = "WEBVTT\r\n";

    this.addStyle = function (selector, styles) {
        content += `\r\nSTYLE\r\n::cue(${selector}) {\r\n    ${Object.keys(
            styles
        )
            .map((key) => `${key}: ${styles[key]};`)
            .join("\r\n    ")}\r\n}\r\n`;
    };
    this.add = function (from, to, lines, settings) {
        ++counter;
        lines = lines.constructor === Array ? lines : [lines];

        content += `\r\n${counter}\r\n${secondsToTime(
            from
        )} --> ${secondsToTime(to)}${
            settings ? " " + settings : ""
        }\r\n${lines.join("\r\n")}\r\n`;
    };

    this.toString = function () {
        return content;
    };
}

const analyzeSubtitle = function (subtitlePath) {
    const transcript = fs.readFileSync(subtitlePath, "utf-8");
    const cues = transcript
        .split("\n\n")
        .filter(
            (line) => !line.startsWith("WEBVTT") && !line.startsWith("STYLE")
        )
        .map((line) => {
            const [time, text] = line.split("\n");
            const [start, end] = time.split(" --> ").map((t) => {
                const [hms, ms] = t.split(".");
                let second = hms
                    .split(":")
                    .reduce((prev, cur) => prev * 60 + cur, 0);
                return second * 1000 + parseInt(ms);
            });
            return { start, end, text };
        });
    return cues;
};

export const refactorSubtitle = async function (subtitlePath, payload) {
    let sentences = analyzeSubtitle(subtitlePath);
    let words = payload.words || [];

    console.log(sentences, words);

    let vtt = new VTT();
    vtt.addStyle("b", {
        "background-color": "green",
        color: "red",
        "font-style": "italic",
    });

    let i,
        j = 0,
        slide = 0;
    for (let i = 0; i < words.length; ++i) {
        while (j < sentences.length && sentences[j].end < words[i].end)
            ++j, (slide = 0);
        if (j == sentences.length) continue;
        let currentText = sentences[j].text,
            currentWord = words[i].text;
        slide = currentText.indexOf(currentWord, slide);

        let subtitleEnd =
            i + 1 < words.length && words[i + 1].start - words[i].end < 500
                ? words[i + 1].start
                : words[i].end;
        vtt.add(
            words[i].start / 1000,
            (subtitleEnd - 50) / 1000,
            `${currentText.substring(
                0,
                slide
            )}<b>${currentWord}</b>${currentText.substring(
                slide + currentWord.length
            )}`
        );

        slide = slide + currentWord.length;
    }
    try {
        let writable = fs.createWriteStream(subtitlePath);
        fs.writeFileSync(subtitlePath + ".vtt", vtt.toString());
        webvtt2ass(subtitlePath + ".vtt", writable);
        await new Promise((resolve, reject) => {
            writable.on("close", resolve);
            writable.on("error", reject);
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
