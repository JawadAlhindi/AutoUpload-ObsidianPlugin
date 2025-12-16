import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { TFile } from "obsidian";
import { ImageUploader } from "./ImageUploader";
import AutoUploaderPlugin from "../../main";

export class S3Uploader implements ImageUploader {
    private plugin: AutoUploaderPlugin;

    constructor(plugin: AutoUploaderPlugin) {
        this.plugin = plugin;
    }

    async testConnection(): Promise<void> {
        const settings = this.plugin.settings;

        if (!settings.s3AccessKey || !settings.s3SecretKey || !settings.s3Bucket) {
            throw new Error("S3 settings are incomplete. Please fill Access Key, Secret Key and Bucket.");
        }

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

        const client = new S3Client(clientConfig);

        try {
            await client.send(new HeadBucketCommand({ Bucket: settings.s3Bucket }));
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

        const clientConfig: any = {
            region: settings.s3Region || "auto",
            credentials: {
                accessKeyId: settings.s3AccessKey,
                secretAccessKey: settings.s3SecretKey,
            },
        };

        // Only add endpoint if it's provided (required for non-AWS providers like R2, Hetzner, Supabase, etc.)
        if (settings.s3Endpoint) {
            clientConfig.endpoint = settings.s3Endpoint;
        }

        // Force path style is often needed for MinIO or some S3 compatible providers
        if (settings.s3ForcePathStyle) {
            clientConfig.forcePathStyle = true;
        }

        const client = new S3Client(clientConfig);

        const arrayBuffer = await this.plugin.app.vault.readBinary(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Use the original filename as the object key
        const key = file.name;

        const command = new PutObjectCommand({
            Bucket: settings.s3Bucket,
            Key: key,
            Body: uint8Array,
            ContentType: this.getContentType(file.extension),
        });

        try {
            await client.send(command);
            
            // Construct the public URL
            if (settings.s3PublicDomain) {
                const domain = settings.s3PublicDomain.replace(/\/$/, "");
                return `${domain}/${key}`;
            } else {
                // Fallback to standard S3 URL format if no custom domain
                // This varies by provider, so custom domain is highly recommended
                if (settings.s3Endpoint) {
                    // Attempt to guess for generic S3-compatible endpoint
                    return `${settings.s3Endpoint.replace(/\/$/, "")}/${settings.s3Bucket}/${key}`;
                }
                return `https://${settings.s3Bucket}.s3.${settings.s3Region}.amazonaws.com/${key}`;
            }

        } catch (error: any) {
            console.error("S3 Upload Error:", error);
            throw new Error(`S3 upload failed: ${error.message}`);
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
