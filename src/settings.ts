import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import { S3Uploader } from "./uploaders/S3Uploader";
import { R2Uploader } from "./uploaders/R2Uploader";

export interface AutoUploaderSettings {
    watchFolder: string;
    youtubeToken: string;
    youtubeRefreshToken: string;
    // S3 Settings (universal S3-compatible providers: AWS, Supabase, Hetzner, etc.)
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
    // Image provider selection
    imageProvider: "s3" | "r2";
    // Cache of uploaded files to avoid double uploads (file name -> URL)
    uploadCache: Record<string, string>;
}

export const DEFAULT_SETTINGS: AutoUploaderSettings = {
    watchFolder: "auto-upload/",
    youtubeToken: "",
    youtubeRefreshToken: "",
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
    imageProvider: "r2",
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

        // ── General ──────────────────────────────────────────────────────────
        new Setting(containerEl)
            .setName("Watch Folder")
            .setDesc(
                "Relative path inside your vault where media files live. " +
                "The ribbon button scans this folder and uploads any new images/videos. " +
                "Example: auto-upload/"
            )
            .addText(text => text
                .setPlaceholder("auto-upload/")
                .setValue(this.plugin.settings.watchFolder)
                .onChange(async (value) => {
                    this.plugin.settings.watchFolder = value;
                    await this.plugin.saveSettings();
                }));

        // ── YouTube ───────────────────────────────────────────────────────────
        containerEl.createEl("h3", { text: "YouTube Settings (for video uploads)" });

        containerEl.createEl("p", {
            text: "Access tokens expire after ~1 hour. Storing a refresh token lets the plugin renew them automatically.",
            attr: { style: "font-size: 0.85em; color: var(--text-muted); margin: 0 0 12px;" }
        });

        new Setting(containerEl)
            .setName("Authorize YouTube")
            .setDesc(
                "Opens the Auth Helper page where you can complete the OAuth flow and copy your tokens. " +
                "After authorization, paste the Access Token and Refresh Token into the fields below."
            )
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
            .setDesc(
                "Short-lived OAuth access token (starts with ya29.). " +
                "Auto-filled after authorization, or paste manually. Expires after ~1 hour."
            )
            .addText(text => text
                .setPlaceholder("ya29.a0...")
                .setValue(this.plugin.settings.youtubeToken)
                .onChange(async (value) => {
                    this.plugin.settings.youtubeToken = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("YouTube Refresh Token")
            .setDesc(
                "Long-lived token used to automatically renew the access token without re-authorizing. " +
                "Auto-filled after authorization. Keep this secret."
            )
            .addText(text => text
                .setPlaceholder("1//0...")
                .setValue(this.plugin.settings.youtubeRefreshToken)
                .onChange(async (value) => {
                    this.plugin.settings.youtubeRefreshToken = value;
                    await this.plugin.saveSettings();
                }));

        // ── Image Upload ──────────────────────────────────────────────────────
        containerEl.createEl("h3", { text: "Image Upload Settings" });

        new Setting(containerEl)
            .setName("Image Provider")
            .setDesc(
                "Choose where to upload images. " +
                "Cloudflare R2 is recommended for most users — it has a generous free tier and no egress fees. " +
                "Use S3-compatible if your provider is AWS, Hetzner, Supabase, MinIO, or another S3-compatible service."
            )
            .addDropdown(dropdown => dropdown
                .addOption("r2", "Cloudflare R2")
                .addOption("s3", "S3 / Hetzner / Supabase / Generic S3")
                .setValue(this.plugin.settings.imageProvider)
                .onChange(async (value: "s3" | "r2") => {
                    this.plugin.settings.imageProvider = value;
                    await this.plugin.saveSettings();
                    this.display(); // Refresh to show/hide relevant settings
                }));

        if (this.plugin.settings.imageProvider === "r2") {
            // ── Cloudflare R2 ─────────────────────────────────────────────────
            containerEl.createEl("h4", { text: "Cloudflare R2 Storage" });

            new Setting(containerEl)
                .setName("Account ID")
                .setDesc(
                    "Your Cloudflare Account ID. " +
                    "Find it in the Cloudflare dashboard: open any zone (or the R2 page) and look for 'Account ID' in the right-hand sidebar."
                )
                .addText(text => text
                    .setPlaceholder("e4d5295b64a2ba0bf8cd7176968d6bea")
                    .setValue(this.plugin.settings.r2AccountId)
                    .onChange(async (value) => {
                        this.plugin.settings.r2AccountId = value.trim();
                        await this.plugin.saveSettings();
                        updateEndpointPreview();
                    }));

            // Show endpoint preview
            const endpointPreview = containerEl.createEl("div", {
                cls: "r2-endpoint-preview",
                attr: {
                    style: "margin-top: -10px; margin-bottom: 10px; padding: 8px; " +
                           "background: var(--background-secondary); border-radius: 4px; " +
                           "font-size: 0.85em; color: var(--text-muted);"
                }
            });

            const updateEndpointPreview = () => {
                if (this.plugin.settings.r2AccountId) {
                    endpointPreview.textContent =
                        `S3 API endpoint (auto-generated): https://${this.plugin.settings.r2AccountId}.r2.cloudflarestorage.com`;
                    endpointPreview.style.color = "var(--text-normal)";
                } else {
                    endpointPreview.textContent = "S3 API endpoint will be auto-generated from Account ID above.";
                    endpointPreview.style.color = "var(--text-muted)";
                }
            };
            updateEndpointPreview();

            new Setting(containerEl)
                .setName("Bucket Name")
                .setDesc("The name of your R2 bucket. Case-sensitive. Create one in the R2 section of the Cloudflare dashboard if needed.")
                .addText(text => text
                    .setPlaceholder("my-bucket")
                    .setValue(this.plugin.settings.r2Bucket)
                    .onChange(async (value) => {
                        this.plugin.settings.r2Bucket = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Access Key ID")
                .setDesc(
                    "R2 API Token Access Key ID. " +
                    "Create one at: Cloudflare Dashboard → R2 → Manage R2 API Tokens → Create API Token."
                )
                .addText(text => text
                    .setPlaceholder("Access Key ID")
                    .setValue(this.plugin.settings.r2AccessKeyId)
                    .onChange(async (value) => {
                        this.plugin.settings.r2AccessKeyId = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Secret Access Key")
                .setDesc("R2 API Token Secret Access Key. Shown only once when creating the token — store it securely.")
                .addText(text => {
                    text
                        .setPlaceholder("Secret Access Key")
                        .setValue(this.plugin.settings.r2SecretAccessKey)
                        .onChange(async (value) => {
                            this.plugin.settings.r2SecretAccessKey = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.type = "password";
                    return text;
                });

            new Setting(containerEl)
                .setName("Public Domain (Optional)")
                .setDesc(
                    "Custom domain you have mapped to your R2 bucket (e.g. https://media.example.com). " +
                    "Takes priority over the Public URL field below. Leave blank if you have not set up a custom domain."
                )
                .addText(text => text
                    .setPlaceholder("https://media.example.com")
                    .setValue(this.plugin.settings.r2PublicDomain)
                    .onChange(async (value) => {
                        this.plugin.settings.r2PublicDomain = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Public URL / R2.dev Subdomain (Optional)")
                .setDesc(
                    "R2.dev development subdomain for your bucket (e.g. https://pub-xxxxxxxxxxxx.r2.dev). " +
                    "Enable public access for your bucket in the R2 dashboard, then copy the URL here. " +
                    "Used only when no custom domain is set above. " +
                    "Note: at least one public URL field must be filled or uploaded files will not be accessible."
                )
                .addText(text => text
                    .setPlaceholder("https://pub-xxxxxxxxxxxx.r2.dev")
                    .setValue(this.plugin.settings.r2PublicUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.r2PublicUrl = value.trim();
                        await this.plugin.saveSettings();
                    }));

            // R2 connection test
            new Setting(containerEl)
                .setName("Test R2 Connection")
                .setDesc("Verifies that your Account ID, Bucket, Access Key, and Secret Key are correct by sending a HEAD request.")
                .addButton(button => button
                    .setButtonText("Test Connection")
                    .onClick(async () => {
                        new Notice("Checking R2 connection…");
                        try {
                            const uploader = new R2Uploader(this.plugin);
                            await uploader.testConnection();
                            new Notice("✅ R2 connection successful.");
                        } catch (err: any) {
                            console.error("R2 connection test error:", err);
                            new Notice("❌ R2 connection failed: " + (err.message ?? err));
                        }
                    }));

            // Help text
            const helpText = containerEl.createEl("div", {
                attr: {
                    style: "margin-top: 16px; padding: 12px; background: var(--background-secondary-alt); " +
                           "border-radius: 4px; font-size: 0.85em; color: var(--text-muted);"
                }
            });
            helpText.innerHTML = `
                <strong>💡 R2 Quick Setup Checklist:</strong><br>
                1. <strong>Account ID</strong> — Cloudflare dashboard sidebar<br>
                2. <strong>Bucket</strong> — Create one in Cloudflare → R2<br>
                3. <strong>API Keys</strong> — Cloudflare → R2 → Manage R2 API Tokens<br>
                4. <strong>Public URL</strong> — Either enable the R2.dev subdomain in the bucket settings,
                   or connect a custom domain. One of these is required for uploaded files to be publicly accessible.
            `;
        } else {
            // ── S3-Compatible ─────────────────────────────────────────────────
            containerEl.createEl("h4", { text: "S3 Compatible Storage (AWS, Hetzner, Supabase, MinIO)" });

            new Setting(containerEl)
                .setName("Endpoint")
                .setDesc(
                    "Full URL of the S3-compatible API endpoint. Required for non-AWS providers. " +
                    "Leave blank for standard AWS S3 (region-based URL is used automatically). " +
                    "Examples — Hetzner: https://fsn1.your-objectstorage.com · Supabase: found in Storage settings · MinIO: http://localhost:9000"
                )
                .addText(text => text
                    .setPlaceholder("https://...")
                    .setValue(this.plugin.settings.s3Endpoint)
                    .onChange(async (value) => {
                        this.plugin.settings.s3Endpoint = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Region")
                .setDesc(
                    "AWS/S3 region identifier. " +
                    "Use auto for Cloudflare R2. " +
                    "For AWS use standard region codes (e.g. us-east-1, eu-west-2). " +
                    "For Hetzner use eu-central. Check your provider's documentation if unsure."
                )
                .addText(text => text
                    .setPlaceholder("auto")
                    .setValue(this.plugin.settings.s3Region)
                    .onChange(async (value) => {
                        this.plugin.settings.s3Region = value.trim() || "auto";
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Bucket Name")
                .setDesc("Name of your storage bucket. Case-sensitive.")
                .addText(text => text
                    .setPlaceholder("my-bucket")
                    .setValue(this.plugin.settings.s3Bucket)
                    .onChange(async (value) => {
                        this.plugin.settings.s3Bucket = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Access Key ID")
                .setDesc("S3 Access Key ID (from IAM for AWS, or your provider's equivalent).")
                .addText(text => text
                    .setPlaceholder("AKIAIOSFODNN7EXAMPLE")
                    .setValue(this.plugin.settings.s3AccessKey)
                    .onChange(async (value) => {
                        this.plugin.settings.s3AccessKey = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Secret Access Key")
                .setDesc("S3 Secret Access Key. Keep this private — it grants full access to your bucket.")
                .addText(text => {
                    text
                        .setPlaceholder("wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY")
                        .setValue(this.plugin.settings.s3SecretKey)
                        .onChange(async (value) => {
                            this.plugin.settings.s3SecretKey = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.type = "password";
                    return text;
                });

            new Setting(containerEl)
                .setName("Public Domain (Optional)")
                .setDesc(
                    "Custom domain or CDN URL for public file access (e.g. https://media.example.com). " +
                    "If left blank, a URL is constructed from the endpoint and bucket name."
                )
                .addText(text => text
                    .setPlaceholder("https://media.example.com")
                    .setValue(this.plugin.settings.s3PublicDomain)
                    .onChange(async (value) => {
                        this.plugin.settings.s3PublicDomain = value.trim();
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName("Force Path Style")
                .setDesc(
                    "Formats request URLs as endpoint/bucket/key instead of bucket.endpoint/key. " +
                    "Required for MinIO and some self-hosted or non-AWS S3-compatible providers. " +
                    "Not needed for AWS or Hetzner."
                )
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.s3ForcePathStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.s3ForcePathStyle = value;
                        await this.plugin.saveSettings();
                    }));

            // S3 connection test
            new Setting(containerEl)
                .setName("Test S3 Connection")
                .setDesc("Verifies that your S3-compatible credentials and bucket name are correct by sending a HeadBucket request.")
                .addButton(button => button
                    .setButtonText("Test Connection")
                    .onClick(async () => {
                        new Notice("Checking S3 connection…");
                        try {
                            const uploader = new S3Uploader(this.plugin);
                            await uploader.testConnection();
                            new Notice("✅ S3 connection successful.");
                        } catch (err: any) {
                            console.error("S3 connection test error:", err);
                            new Notice("❌ S3 connection failed: " + (err.message ?? err));
                        }
                    }));
        }

        // ── Maintenance ───────────────────────────────────────────────────────
        containerEl.createEl("h3", { text: "Maintenance" });

        new Setting(containerEl)
            .setName("Clear Upload Cache")
            .setDesc(
                "Removes the plugin's record of previously uploaded files. " +
                "The next upload run will re-upload all media it finds. " +
                "Use this if you have renamed, replaced, or deleted previously uploaded files and want them re-uploaded."
            )
            .addButton(button => button
                .setButtonText("Clear Cache")
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings.uploadCache = {};
                    await this.plugin.saveSettings();
                    new Notice("Upload cache cleared.");
                }));
    }
}
