import { TFile } from "obsidian";
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
    }

    // Default to R2
    try {
        const uploader = new R2Uploader(plugin);
        return await uploader.upload(file);
    } catch (error) {
        console.error("R2 Upload Error:", error);
        throw error;
    }
}
