import path from "path";

export const isHttpPath = (_path) => {
    try {
        const url = new URL(_path);
        if (url.protocol === "http:" || url.protocol === "https:") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Invalid path:", _path);
        return false;
    }
};

export const getBasenameWithoutExt = (_path) => {
    console.log(_path)
    return path.basename(_path).replace(/\.[^/.]+$/, "");
};
