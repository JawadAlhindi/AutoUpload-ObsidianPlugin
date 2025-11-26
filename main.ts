import { Plugin, TFile, Notice } from "obsidian";
import { AutoUploaderSettings, DEFAULT_SETTINGS, AutoUploaderSettingTab } from "./src/settings";
import { uploadImage } from "./src/uploadImage";
import { uploadVideo } from "./src/uploadVideo";

export default class AutoUploaderPlugin extends Plugin {
    settings: AutoUploaderSettings;

    async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.addSettingTab(new AutoUploaderSettingTab(this.app, this));

        this.registerEvent(
            this.app.vault.on("create", async (file: TFile) => {
                console.log("File created:", file.path);
                
                if (!file.path.startsWith(this.settings.watchFolder)) {
                    console.log("File not in watch folder. Expected:", this.settings.watchFolder, "Got:", file.path);
                    return;
                }

                console.log("File is in watch folder! Processing...");
                new Notice("Detected file in auto-upload folder: " + file.name);

                const ext = file.extension.toLowerCase();
                console.log("File extension:", ext);

                try {
                    if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) {
                        new Notice("Uploading image: " + file.name);
                        const url = await uploadImage(this, file);
                        this.insertLink(file, url);
                    }
                    else if (["mp4", "mov", "m4v"].includes(ext)) {
                        new Notice("Uploading video to YouTube: " + file.name);
                        const url = await uploadVideo(this, file);
                        this.insertLink(file, url);
                    }
                } catch (err) {
                    console.error("Upload error:", err);
                    new Notice("Upload failed: " + err);
                }
            })
        );
    }

    insertLink(file: TFile, url: string) {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) return;
        editor.replaceSelection(url);
        new Notice("Uploaded: " + file.name);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
