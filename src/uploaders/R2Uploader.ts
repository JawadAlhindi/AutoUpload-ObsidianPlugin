import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { TFile, Notice } from "obsidian";
import { ImageUploader } from "./ImageUploader";
import AutoUploaderPlugin from "../../main";

export class R2Uploader implements ImageUploader {
    private plugin: AutoUploaderPlugin;

    constructor(plugin: AutoUploaderPlugin) {
        this.plugin = plugin;
    }

    async upload(file: TFile): Promise<string> {
        const settings = this.plugin.settings;
        
        if (!settings.r2AccessKeyId || !settings.r2SecretAccessKey || !settings.r2Bucket || !settings.r2AccountId) {
            throw new Error("R2 credentials are incomplete. Please check your settings.");
        }

        // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
        const endpoint = `https://${settings.r2AccountId}.r2.cloudflarestorage.com`;

        const clientConfig: any = {
            region: "auto", // R2 uses "auto" for region
            credentials: {
                accessKeyId: settings.r2AccessKeyId,
                secretAccessKey: settings.r2SecretAccessKey,
            },
            endpoint: endpoint,
            forcePathStyle: true, // R2 requires path-style access
        };

        const client = new S3Client(clientConfig);

        const arrayBuffer = await this.plugin.app.vault.readBinary(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Generate a unique key for the file
        const key = file.name; 

        const command = new PutObjectCommand({
            Bucket: settings.r2Bucket,
            Key: key,
            Body: uint8Array,
            ContentType: this.getContentType(file.extension),
        });

        try {
            await client.send(command);
            
            // Construct the public URL
            if (settings.r2PublicDomain) {
                // Use custom domain if provided
                const domain = settings.r2PublicDomain.replace(/\/$/, "");
                return `${domain}/${key}`;
            } else if (settings.r2PublicUrl) {
                // Use custom public URL if provided
                const url = settings.r2PublicUrl.replace(/\/$/, "");
                return `${url}/${key}`;
            } else {
                // Default R2 public URL format (requires public bucket access)
                // Format: https://<bucket-name>.<account-id>.r2.cloudflarestorage.com/<key>
                return `https://${settings.r2Bucket}.${settings.r2AccountId}.r2.cloudflarestorage.com/${key}`;
            }

        } catch (error) {
            console.error("R2 Upload Error:", error);
            throw new Error(`R2 upload failed: ${error.message}`);
        }
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

