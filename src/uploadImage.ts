import { requestUrl, TFile, Notice } from "obsidian";
import AutoUploaderPlugin from "../main";
import { S3Uploader } from "./uploaders/S3Uploader";
import { R2Uploader } from "./uploaders/R2Uploader";

export async function uploadImage(plugin: AutoUploaderPlugin, file: TFile): Promise<string> {
    const settings = plugin.settings;

    if (settings.imageProvider === "s3") {
        try {
            const uploader = new S3Uploader(plugin);
            return await uploader.upload(file);
        } catch (error) {
            console.error("S3 Upload Error:", error);
            throw error;
        }
    } else if (settings.imageProvider === "r2") {
        try {
            const uploader = new R2Uploader(plugin);
            return await uploader.upload(file);
        } catch (error) {
            console.error("R2 Upload Error:", error);
            throw error;
        }
    } else {
        // Default to Imgur
        return await uploadToImgur(plugin, file);
    }
}

async function uploadToImgur(plugin: AutoUploaderPlugin, file: TFile): Promise<string> {
    const data = await plugin.app.vault.readBinary(file);

    if (!plugin.settings.imgurClientId) {
        throw new Error("Imgur Client ID not configured");
    }

    const res = await requestUrl({
        url: "https://api.imgur.com/3/image",
        method: "POST",
        headers: {
            Authorization: `Client-ID ${plugin.settings.imgurClientId}`
        },
        body: data
    });

    return res.json.data.link;
}