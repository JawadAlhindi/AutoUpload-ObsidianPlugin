import { requestUrl, TFile } from "obsidian";
import { ImageUploader } from "./ImageUploader";
import AutoUploaderPlugin from "../../main";

export class R2Uploader implements ImageUploader {
    private plugin: AutoUploaderPlugin;

    constructor(plugin: AutoUploaderPlugin) {
        this.plugin = plugin;
    }

    async testConnection(): Promise<void> {
        const settings = this.plugin.settings;

        if (!settings.r2AccessKeyId || !settings.r2SecretAccessKey || !settings.r2Bucket || !settings.r2AccountId) {
            throw new Error("R2 settings are incomplete. Please fill Account ID, Bucket, Access Key and Secret Key.");
        }

        const endpoint = `https://${settings.r2AccountId}.r2.cloudflarestorage.com`;
        const bucket = settings.r2Bucket;
        const key = "__connection-test__";
        const encodedKey = encodeURIComponent(key).replace(/%2F/g, "/");
        const canonicalPath = `/${bucket}/${encodedKey}`;
        const url = `${endpoint}${canonicalPath}`;

        try {
            const headers = await this.generateSignedHeaders(
                "HEAD",
                endpoint,
                canonicalPath,
                settings.r2AccessKeyId,
                settings.r2SecretAccessKey,
                "",
                new ArrayBuffer(0)
            );

            const response = await requestUrl({
                url,
                method: "HEAD",
                headers
            });

            // 200/204 = object exists; 404 = object not found but bucket accessible — both mean credentials are valid
            if (![200, 204, 404].includes(response.status)) {
                throw new Error(`Unexpected status ${response.status}`);
            }
        } catch (error: any) {
            console.error("R2 connection test failed:", error);
            throw new Error(`R2 connection failed: ${error.message ?? error}`);
        }
    }

    async upload(file: TFile): Promise<string> {
        const settings = this.plugin.settings;

        if (!settings.r2AccessKeyId || !settings.r2SecretAccessKey || !settings.r2Bucket || !settings.r2AccountId) {
            throw new Error("R2 credentials are incomplete. Please check your settings.");
        }

        // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
        const endpoint = `https://${settings.r2AccountId}.r2.cloudflarestorage.com`;
        const bucket = settings.r2Bucket;
        const key = file.name;

        // For signing, canonical URI must use the same encoded path as the actual request.
        const encodedKey = encodeURIComponent(key).replace(/%2F/g, "/");
        const canonicalPath = `/${bucket}/${encodedKey}`;
        const url = `${endpoint}${canonicalPath}`;

        try {
            // 1) Check if the object already exists to avoid re-uploading and consuming quota.
            try {
                const headHeaders = await this.generateSignedHeaders(
                    "HEAD",
                    endpoint,
                    canonicalPath,
                    settings.r2AccessKeyId,
                    settings.r2SecretAccessKey,
                    "",
                    new ArrayBuffer(0)
                );

                const headResponse = await requestUrl({
                    url,
                    method: "HEAD",
                    headers: headHeaders
                });

                if (headResponse.status === 200 || headResponse.status === 204) {
                    // Object already exists — return its public URL without re-uploading.
                    return this.buildPublicUrl(key);
                }
            } catch (headError) {
                // HEAD 404 or network error — fall through to upload.
            }

            // 2) Object does not exist — upload it.
            const arrayBuffer = await this.plugin.app.vault.readBinary(file);
            const contentType = this.getContentType(file.extension);

            const headers = await this.generateSignedHeaders(
                "PUT",
                endpoint,
                canonicalPath,
                settings.r2AccessKeyId,
                settings.r2SecretAccessKey,
                contentType,
                arrayBuffer
            );

            // Use Obsidian's requestUrl to bypass CORS restrictions in Electron.
            const response = await requestUrl({
                url,
                method: "PUT",
                headers,
                body: arrayBuffer
            });

            if (response.status !== 200 && response.status !== 204) {
                throw new Error(`Upload failed with status ${response.status}: ${response.text || "Unknown error"}`);
            }

            return this.buildPublicUrl(key);

        } catch (error: any) {
            console.error("R2 Upload Error:", error);
            throw new Error(`R2 upload failed: ${error.message || error}`);
        }
    }

    private async generateSignedHeaders(
        method: string,
        endpoint: string,
        canonicalPath: string,
        accessKeyId: string,
        secretAccessKey: string,
        contentType: string,
        body: ArrayBuffer
    ): Promise<Record<string, string>> {
        const urlObj = new URL(endpoint);
        const host = urlObj.host;
        const region = "auto"; // R2 uses "auto" for region
        const service = "s3";
        const algorithm = "AWS4-HMAC-SHA256";

        const now = new Date();
        const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 8); // YYYYMMDD
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z"; // YYYYMMDDTHHMMSSZ
        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

        const canonicalUri = canonicalPath;
        const canonicalQueryString = "";
        const bodyArray = new Uint8Array(body);
        const payloadHash = await this.sha256(bodyArray);

        const canonicalHeaders = [
            `host:${host}`,
            `x-amz-content-sha256:${payloadHash}`,
            `x-amz-date:${amzDate}`
        ].join("\n") + "\n";

        const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

        const canonicalRequest = [
            method,
            canonicalUri,
            canonicalQueryString,
            canonicalHeaders,
            signedHeaders,
            payloadHash
        ].join("\n");

        const canonicalRequestBytes = this.stringToUint8Array(canonicalRequest);
        const canonicalRequestHash = await this.sha256(canonicalRequestBytes);

        const stringToSign = [
            algorithm,
            amzDate,
            credentialScope,
            canonicalRequestHash
        ].join("\n");

        const kSecret = this.stringToUint8Array(`AWS4${secretAccessKey}`);
        const kDate = await this.hmacSha256(kSecret, dateStamp);
        const kRegion = await this.hmacSha256(kDate, region);
        const kService = await this.hmacSha256(kRegion, service);
        const kSigning = await this.hmacSha256(kService, "aws4_request");
        const signatureBytes = await this.hmacSha256(kSigning, stringToSign);
        const signature = Array.from(signatureBytes).map(b => b.toString(16).padStart(2, "0")).join("");

        const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

        // Obsidian's requestUrl sets the Host header automatically.
        return {
            "x-amz-content-sha256": payloadHash,
            "x-amz-date": amzDate,
            "Authorization": authorization,
            "Content-Type": contentType
        };
    }

    private async sha256(data: Uint8Array | ArrayBuffer): Promise<string> {
        const buffer = data instanceof ArrayBuffer ? data : new Uint8Array(data).buffer;
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    private async hmacSha256(key: Uint8Array, data: string): Promise<Uint8Array> {
        const keyArray = new Uint8Array(key);
        const keyBuffer = keyArray.buffer.slice(keyArray.byteOffset, keyArray.byteOffset + keyArray.byteLength);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBuffer as ArrayBuffer,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const dataBytes = new TextEncoder().encode(data);
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
        return new Uint8Array(signature);
    }

    private stringToUint8Array(str: string): Uint8Array {
        return new TextEncoder().encode(str);
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

    private buildPublicUrl(originalKey: string): string {
        const settings = this.plugin.settings;
        const encoded = encodeURIComponent(originalKey);

        if (settings.r2PublicDomain) {
            const domain = settings.r2PublicDomain.replace(/\/$/, "");
            return `${domain}/${encoded}`;
        }

        if (settings.r2PublicUrl) {
            const publicUrl = settings.r2PublicUrl.replace(/\/$/, "");
            return `${publicUrl}/${encoded}`;
        }

        // Neither public URL field is configured. The S3 API endpoint is not a public CDN URL.
        throw new Error(
            "No public URL configured for R2. " +
            "Please set either 'Public Domain' (custom domain) or 'Public URL / R2.dev Subdomain' in settings. " +
            "Enable public access for your bucket in the Cloudflare R2 dashboard first."
        );
    }
}
