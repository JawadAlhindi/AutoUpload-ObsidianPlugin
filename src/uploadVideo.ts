import { requestUrl, TFile } from "obsidian";
import AutoUploaderPlugin from "../main";

export async function uploadVideo(plugin: AutoUploaderPlugin, file: TFile) {
    let token = plugin.settings.youtubeToken;

    if (!token || token.trim() === "") {
        throw new Error("YouTube token is not configured. Please authorize YouTube in settings.");
    }

    // Try to refresh token if we have a refresh token
    if (plugin.settings.youtubeRefreshToken) {
        const { YouTubeAuth } = await import("./youtubeAuth");
        const auth = new YouTubeAuth(plugin);
        try {
            token = await auth.ensureValidToken();
        } catch (error) {
            console.log("Token refresh failed, using existing token:", error);
        }
    }

    console.log("Starting YouTube upload for:", file.name);
    console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

    const data = await plugin.app.vault.readBinary(file);
    console.log("File size:", data.byteLength, "bytes");

    try {
        console.log("Step 1: Initiating resumable upload...");
        const init = await requestUrl({
            url: "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                snippet: {
                    title: file.name,
                    description: "Uploaded via Obsidian AutoUploader"
                },
                status: { privacyStatus: "unlisted" }
            })
        });

        console.log("Init response status:", init.status);
        console.log("Upload URL obtained:", init.headers.location);

        const uploadUrl = init.headers.location;

        console.log("Step 2: Uploading video data...");
        const upload = await requestUrl({
            url: uploadUrl,
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Length": data.byteLength.toString(),
                "Content-Type": "video/*"
            },
            body: data
        });

        console.log("Upload complete! Response:", upload.json);
        return `https://youtu.be/${upload.json.id}`;
    } catch (error: any) {
        console.error("YouTube upload failed:", error);
        console.error("Error status:", error.status);
        console.error("Error response:", error.message);
        
        if (error.status === 403) {
            throw new Error("YouTube API rejected the request (403). Your token may be expired or invalid. Please get a new token from OAuth Playground.");
        } else if (error.status === 401) {
            throw new Error("YouTube authentication failed (401). Please check your token.");
        } else {
            throw new Error(`YouTube upload failed: ${error.message}`);
        }
    }
}
