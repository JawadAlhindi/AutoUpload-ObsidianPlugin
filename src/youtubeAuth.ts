import { Notice, requestUrl } from "obsidian";
import AutoUploaderPlugin from "../main";

// You'll need to create your own OAuth app and use these credentials
// Get them from: https://console.cloud.google.com/
const CLIENT_ID = "YOUR_CLIENT_ID_HERE"; // Replace with your actual client ID
const CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE"; // Replace with your actual client secret
const REDIRECT_URI = "http://localhost:42813/callback"; // Local callback URL

export class YouTubeAuth {
    plugin: AutoUploaderPlugin;
    private server: any = null;

    constructor(plugin: AutoUploaderPlugin) {
        this.plugin = plugin;
    }

    /**
     * Opens browser for OAuth authorization
     */
    async startAuthFlow(): Promise<void> {
        // Check if credentials are configured
        if (CLIENT_ID === "YOUR_CLIENT_ID_HERE" || CLIENT_SECRET === "YOUR_CLIENT_SECRET_HERE") {
            new Notice("⚠️ OAuth credentials not configured. Please follow setup instructions in README.");
            return;
        }

        const authUrl = this.buildAuthUrl();
        
        new Notice("Opening browser for YouTube authorization...");
        console.log("Auth URL:", authUrl);

        // Start local server to receive callback
        await this.startLocalServer();

        // Open browser
        window.open(authUrl, "_blank");
    }

    /**
     * Build OAuth authorization URL
     */
    private buildAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "code",
            scope: "https://www.googleapis.com/auth/youtube.upload",
            access_type: "offline", // Get refresh token
            prompt: "consent" // Force consent screen to get refresh token
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Start local HTTP server to receive OAuth callback
     * Note: This requires Node.js http module which may not be available in Obsidian
     * Alternative: Use external tool or manual token entry
     */
    private async startLocalServer(): Promise<void> {
        new Notice("⚠️ Local server callback not yet implemented. Using manual token entry instead.");
        
        // For now, show instructions for manual token entry
        this.showManualInstructions();
    }

    /**
     * Show instructions for manual token entry
     */
    private showManualInstructions(): void {
        const instructions = `
To get your YouTube token manually:

1. The browser will open OAuth Playground
2. On the left, find "YouTube Data API v3"
3. Check: https://www.googleapis.com/auth/youtube.upload
4. Click "Authorize APIs"
5. Sign in with your Google account
6. Click "Exchange authorization code for tokens"
7. Copy the "Access token" AND "Refresh token"
8. Paste them into the plugin settings

The browser will open in 3 seconds...
        `.trim();

        console.log(instructions);
        
        // Open OAuth Playground with pre-selected scope
        setTimeout(() => {
            const playgroundUrl = "https://developers.google.com/oauthplayground/";
            window.open(playgroundUrl, "_blank");
        }, 3000);
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code: string): Promise<{ access_token: string; refresh_token: string }> {
        try {
            const response = await requestUrl({
                url: "https://oauth2.googleapis.com/token",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    grant_type: "authorization_code"
                }).toString()
            });

            return {
                access_token: response.json.access_token,
                refresh_token: response.json.refresh_token
            };
        } catch (error) {
            console.error("Failed to exchange code for tokens:", error);
            throw new Error("OAuth token exchange failed");
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken: string): Promise<string> {
        try {
            console.log("Refreshing YouTube access token...");
            
            const response = await requestUrl({
                url: "https://oauth2.googleapis.com/token",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: "refresh_token"
                }).toString()
            });

            const newAccessToken = response.json.access_token;
            
            // Update settings with new access token
            this.plugin.settings.youtubeToken = newAccessToken;
            await this.plugin.saveSettings();
            
            new Notice("✅ YouTube token refreshed!");
            console.log("Access token refreshed successfully");
            
            return newAccessToken;
        } catch (error) {
            console.error("Failed to refresh access token:", error);
            throw new Error("Token refresh failed. Please re-authorize.");
        }
    }

    /**
     * Check if token is expired and refresh if needed
     */
    async ensureValidToken(): Promise<string> {
        const { youtubeToken, youtubeRefreshToken } = this.plugin.settings;

        // If no refresh token, return current token (will fail if expired)
        if (!youtubeRefreshToken) {
            return youtubeToken;
        }

        // Try to refresh token
        try {
            return await this.refreshAccessToken(youtubeRefreshToken);
        } catch (error) {
            // If refresh fails, return current token and let it fail with better error
            return youtubeToken;
        }
    }
}
