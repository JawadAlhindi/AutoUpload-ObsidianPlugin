import { App, PluginSettingTab, Setting, Notice } from "obsidian";

export interface AutoUploaderSettings {
    watchFolder: string;
    youtubeToken: string;
    youtubeRefreshToken: string;
    imgurClientId: string;
    // S3 Settings
    s3Endpoint: string;
    s3Region: string;
    s3AccessKey: string;
    s3SecretKey: string;
    s3Bucket: string;
    s3PublicDomain: string;
    s3ForcePathStyle: boolean;
    // R2 Settings
    r2AccountId: string;
    r2AccessKeyId: string;
    r2SecretAccessKey: string;
    r2Bucket: string;
    r2PublicDomain: string;
    r2PublicUrl: string;
    imageProvider: "imgur" | "s3" | "r2";
    // Cache of uploaded files to avoid double uploads (file path -> URL)
    uploadCache: Record<string, string>;
}

export const DEFAULT_SETTINGS: AutoUploaderSettings = {
    watchFolder: "auto-upload/",
    youtubeToken: "",
    youtubeRefreshToken: "",
    imgurClientId: "",
    s3Endpoint: "",
    s3Region: "auto",
    s3AccessKey: "",
    s3SecretKey: "",
    s3Bucket: "",
    s3PublicDomain: "",
    s3ForcePathStyle: false,
    r2AccountId: "",
    r2AccessKeyId: "",
    r2SecretAccessKey: "",
    r2Bucket: "",
    r2PublicDomain: "",
    r2PublicUrl: "",
    imageProvider: "imgur",
    uploadCache: {}
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

        // Image Provider Section
        containerEl.createEl("h3", { text: "Image Upload Settings" });

        new Setting(containerEl)
            .setName("Image Provider")
            .setDesc("Choose where to upload images")
            .addDropdown(dropdown => dropdown
                .addOption("imgur", "Imgur")
                .addOption("s3", "S3 / Hetzner")
                .addOption("r2", "Cloudflare R2")
                .setValue(this.plugin.settings.imageProvider)
                .onChange(async (value: "imgur" | "s3" | "r2") => {
                    this.plugin.settings.imageProvider = value;
                    await this.plugin.saveSettings();
                    this.display(); // Refresh to show/hide relevant settings
                }));

        if (this.plugin.settings.imageProvider === "imgur") {
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
        } else if (this.plugin.settings.imageProvider === "r2") {
            containerEl.createEl("h4", { text: "Cloudflare R2 Storage" });

            const accountIdSetting = new Setting(containerEl)
                .setName("Account ID")
                .setDesc("Your Cloudflare Account ID (found in R2 dashboard)")
                .addText(text => text
                    .setPlaceholder("e4d5295b64a2ba0bf8cd7176968d6bea")
                    .setValue(this.plugin.settings.r2AccountId)
                    .onChange(async (value) => {
                        this.plugin.settings.r2AccountId = value;
                        await this.plugin.saveSettings();
                        updateEndpointPreview();
                    }));

            // Show endpoint preview
            const endpointPreview = containerEl.createEl("div", {
                cls: "r2-endpoint-preview",
                attr: { style: "margin-top: -10px; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 4px; font-size: 0.9em; color: var(--text-muted);" }
            });
            
            const updateEndpointPreview = () => {
                if (this.plugin.settings.r2AccountId) {
                    endpointPreview.textContent = `Endpoint: https://${this.plugin.settings.r2AccountId}.r2.cloudflarestorage.com`;
                    endpointPreview.style.color = "var(--text-normal)";
                } else {
                    endpointPreview.textContent = "Endpoint will be auto-generated from Account ID";
                    endpointPreview.style.color = "var(--text-muted)";
                }
            };
            updateEndpointPreview();

            new Setting(containerEl)
                .setName("Bucket Name")
                .setDesc("Name of your R2 bucket")
                .addText(text => text
                    .setPlaceholder("my-bucket")
                    .setValue(this.plugin.settings.r2Bucket)
                    .onChange(async (value) => {
                        this.plugin.settings.r2Bucket = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Access Key ID")
                .setDesc("R2 API Token Access Key ID")
                .addText(text => text
                    .setPlaceholder("Access Key")
                    .setValue(this.plugin.settings.r2AccessKeyId)
                    .onChange(async (value) => {
                        this.plugin.settings.r2AccessKeyId = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Secret Access Key")
                .setDesc("R2 API Token Secret Access Key")
                .addText(text => text
                    .setPlaceholder("Secret Key")
                    .setValue(this.plugin.settings.r2SecretAccessKey)
                    .onChange(async (value) => {
                        this.plugin.settings.r2SecretAccessKey = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Public Domain (Optional)")
                .setDesc("Custom domain for public access (e.g., https://media.mysite.com)")
                .addText(text => text
                    .setPlaceholder("https://media.mysite.com")
                    .setValue(this.plugin.settings.r2PublicDomain)
                    .onChange(async (value) => {
                        this.plugin.settings.r2PublicDomain = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Public URL (Optional)")
                .setDesc("Custom public URL if different from domain (e.g., https://pub-xxx.r2.dev)")
                .addText(text => text
                    .setPlaceholder("https://pub-xxx.r2.dev")
                    .setValue(this.plugin.settings.r2PublicUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.r2PublicUrl = value;
                        await this.plugin.saveSettings();
                    }));

            // Help text
            const helpText = containerEl.createEl("div", {
                attr: { style: "margin-top: 20px; padding: 12px; background: var(--background-secondary-alt); border-radius: 4px; font-size: 0.85em; color: var(--text-muted);" }
            });
            helpText.innerHTML = `
                <strong>💡 Quick Setup:</strong><br>
                • Account ID: Found in Cloudflare R2 dashboard<br>
                • Bucket: Create one in R2 dashboard if needed<br>
                • API Keys: Create in R2 → Manage R2 API Tokens<br>
                • Public URL: Optional - for custom domains or R2.dev subdomain
            `;
        } else {
            containerEl.createEl("h4", { text: "S3 Compatible Storage (R2, AWS, Hetzner)" });

            new Setting(containerEl)
                .setName("Endpoint")
                .setDesc("S3 Endpoint URL (Required for R2/Hetzner, e.g., https://<accountid>.r2.cloudflarestorage.com)")
                .addText(text => text
                    .setPlaceholder("https://...")
                    .setValue(this.plugin.settings.s3Endpoint)
                    .onChange(async (value) => {
                        this.plugin.settings.s3Endpoint = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Region")
                .setDesc("Region (e.g., 'auto' for R2, 'us-east-1' for AWS)")
                .addText(text => text
                    .setPlaceholder("auto")
                    .setValue(this.plugin.settings.s3Region)
                    .onChange(async (value) => {
                        this.plugin.settings.s3Region = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Bucket Name")
                .setDesc("Name of your storage bucket")
                .addText(text => text
                    .setPlaceholder("my-bucket")
                    .setValue(this.plugin.settings.s3Bucket)
                    .onChange(async (value) => {
                        this.plugin.settings.s3Bucket = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Access Key ID")
                .setDesc("S3 Access Key ID")
                .addText(text => text
                    .setPlaceholder("Access Key")
                    .setValue(this.plugin.settings.s3AccessKey)
                    .onChange(async (value) => {
                        this.plugin.settings.s3AccessKey = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Secret Access Key")
                .setDesc("S3 Secret Access Key")
                .addText(text => text
                    .setPlaceholder("Secret Key")
                    .setValue(this.plugin.settings.s3SecretKey)
                    .onChange(async (value) => {
                        this.plugin.settings.s3SecretKey = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Public Domain")
                .setDesc("Custom domain for public access (optional, e.g., https://media.mysite.com)")
                .addText(text => text
                    .setPlaceholder("https://media.mysite.com")
                    .setValue(this.plugin.settings.s3PublicDomain)
                    .onChange(async (value) => {
                        this.plugin.settings.s3PublicDomain = value;
                        await this.plugin.saveSettings();
                    }));
            
            new Setting(containerEl)
                .setName("Force Path Style")
                .setDesc("Enable for providers like MinIO (path-style access)")
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.s3ForcePathStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.s3ForcePathStyle = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // Maintenance / tools
        new Setting(containerEl)
            .setName("Clear upload cache")
            .setDesc("Forget which files were already uploaded (use this if you changed or re-used filenames).")
            .addButton(button => button
                .setButtonText("Clear")
                .onClick(async () => {
                    this.plugin.settings.uploadCache = {};
                    await this.plugin.saveSettings();
                    new Notice("Upload cache cleared.");
                }));
    }
}
