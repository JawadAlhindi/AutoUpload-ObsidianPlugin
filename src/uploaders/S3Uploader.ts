import { S3Client, PutObjectCommand, HeadBucketCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { TFile } from "obsidian";
import { ImageUploader } from "./ImageUploader";
import AutoUploaderPlugin from "../../main";

export class S3Uploader implements ImageUploader {
    private plugin: AutoUploaderPlugin;
    private client: S3Client | null = null;

    constructor(plugin: AutoUploaderPlugin) {
        this.plugin = plugin;
    }

    private getClient(): S3Client {
        if (!this.client) {
            const settings = this.plugin.settings;
            const clientConfig: any = {
                region: settings.s3Region || "auto",
                credentials: {
                    accessKeyId: settings.s3AccessKey,
                    secretAccessKey: settings.s3SecretKey,
                },
            };

            if (settings.s3Endpoint) {
                clientConfig.endpoint = settings.s3Endpoint;
            }

            if (settings.s3ForcePathStyle) {
                clientConfig.forcePathStyle = true;
            }

            this.client = new S3Client(clientConfig);
        }
        return this.client;
    }

    async testConnection(): Promise<void> {
        const settings = this.plugin.settings;

        if (!settings.s3AccessKey || !settings.s3SecretKey || !settings.s3Bucket) {
            throw new Error("S3 settings are incomplete. Please fill Access Key, Secret Key and Bucket.");
        }

        try {
            await this.getClient().send(new HeadBucketCommand({ Bucket: settings.s3Bucket }));
        } catch (error: any) {
            console.error("S3 connection test failed:", error);
            throw new Error(`S3 connection failed: ${error.message ?? error}`);
        }
    }

    async upload(file: TFile): Promise<string> {
        const settings = this.plugin.settings;

        if (!settings.s3AccessKey || !settings.s3SecretKey || !settings.s3Bucket) {
            throw new Error("S3 credentials are incomplete. Please check your settings.");
        }

        const key = file.name;
        const client = this.getClient();

        try {
            // Check if the object already exists to avoid redundant uploads.
            try {
                await client.send(new HeadObjectCommand({
                    Bucket: settings.s3Bucket,
                    Key: key,
                }));
                // Object exists — return its public URL without re-uploading.
                return this.buildPublicUrl(key);
            } catch (headError: any) {
                // 404 / NoSuchKey means the object does not exist — proceed with upload.
                if (headError?.name !== "NotFound" && headError?.$metadata?.httpStatusCode !== 404) {
                    // Unexpected error during HEAD — log but still attempt upload.
                    console.error("S3 HeadObject check failed (will attempt upload):", headError);
                }
            }

            const arrayBuffer = await this.plugin.app.vault.readBinary(file);
            const uint8Array = new Uint8Array(arrayBuffer);

            await client.send(new PutObjectCommand({
                Bucket: settings.s3Bucket,
                Key: key,
                Body: uint8Array,
                ContentType: this.getContentType(file.extension),
            }));

            return this.buildPublicUrl(key);

        } catch (error: any) {
            console.error("S3 Upload Error:", error);
            throw new Error(`S3 upload failed: ${error.message}`);
        }
    }

    private buildPublicUrl(key: string): string {
        const settings = this.plugin.settings;

        if (settings.s3PublicDomain) {
            const domain = settings.s3PublicDomain.replace(/\/$/, "");
            return `${domain}/${key}`;
        }

        if (settings.s3Endpoint) {
            // Generic S3-compatible endpoint: endpoint/bucket/key
            return `${settings.s3Endpoint.replace(/\/$/, "")}/${settings.s3Bucket}/${key}`;
        }

        // Standard AWS S3 URL
        return `https://${settings.s3Bucket}.s3.${settings.s3Region}.amazonaws.com/${key}`;
    }

    private getContentType(extension: string): string {
        const map: Record<string, string> = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "webp": "image/webp",
            "svg": "image/svg+xml",
        };
        return map[extension.toLowerCase()] || "application/octet-stream";
    }
}
