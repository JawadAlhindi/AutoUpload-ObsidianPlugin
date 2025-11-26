import { App, PluginSettingTab, Setting, Notice } from "obsidian";

export interface AutoUploaderSettings {
    watchFolder: string;
    youtubeToken: string;
    youtubeRefreshToken: string;
    imgurClientId: string;
}

export const DEFAULT_SETTINGS: AutoUploaderSettings = {
    watchFolder: "auto-upload/",
    youtubeToken: "",
    youtubeRefreshToken: "",
    imgurClientId: ""
};

export class AutoUploaderSettingTab extends PluginSettingTab {
    plugin: any;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "AutoUploader Settings" });

        new Setting(containerEl)
            .setName("Watch Folder")
            .setDesc("Folder to watch for new files (e.g., 'auto-upload/')")
            .addText(text => text
                .setPlaceholder("auto-upload/")
                .setValue(this.plugin.settings.watchFolder)
                .onChange(async (value) => {
                    this.plugin.settings.watchFolder = value;
                    await this.plugin.saveSettings();
                }));

        // YouTube section
        containerEl.createEl("h3", { text: "YouTube Settings (for video uploads)" });

        new Setting(containerEl)
            .setName("Authorize YouTube")
            .setDesc("Click to open the Auth Helper page to get your tokens")
            .addButton(button => button
                .setButtonText("🔐 Open Auth Helper")
                .setCta()
                .onClick(async () => {
                    // @ts-ignore
                    const electron = require("electron");
                    const path = require("path");
                    
                    const adapter = this.plugin.app.vault.adapter;
                    const basePath = adapter.getBasePath();
                    const helperPath = path.join(basePath, ".obsidian", "plugins", "auto-uploader", "auth-helper.html");
                    
                    try {
                        await electron.shell.openPath(helperPath);
                    } catch (err) {
                        new Notice("Failed to open Auth Helper. Please open 'auth-helper.html' in the plugin folder manually.");
                        console.error("Failed to open auth helper:", err);
                    }
                }));

        new Setting(containerEl)
            .setName("YouTube Access Token")
            .setDesc("Access token for YouTube API (auto-filled after authorization, or paste manually)")
            .addText(text => text
                .setPlaceholder("ya29.a0...")
                .setValue(this.plugin.settings.youtubeToken)
                .onChange(async (value) => {
                    this.plugin.settings.youtubeToken = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("YouTube Refresh Token")
            .setDesc("Refresh token to automatically renew access token (auto-filled after authorization)")
            .addText(text => text
                .setPlaceholder("1//0...")
                .setValue(this.plugin.settings.youtubeRefreshToken)
                .onChange(async (value) => {
                    this.plugin.settings.youtubeRefreshToken = value;
                    await this.plugin.saveSettings();
                }));

        // Imgur section
        containerEl.createEl("h3", { text: "Imgur Settings (for image uploads)" });

        new Setting(containerEl)
            .setName("Imgur Client ID")
            .setDesc("Imgur client ID for image uploads")
            .addText(text => text
                .setPlaceholder("Enter your Imgur client ID")
                .setValue(this.plugin.settings.imgurClientId)
                .onChange(async (value) => {
                    this.plugin.settings.imgurClientId = value;
                    await this.plugin.saveSettings();
                }));
    }
}
