---
title: Token Guide
layout: default
parent: YouTube Integration
nav_order: 3
---

# YouTube Token Guide
{: .no_toc }

Understanding and managing OAuth tokens for YouTube uploads.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Getting Tokens via OAuth Playground

### Step 1: Go to OAuth Playground

Visit: [OAuth Playground](https://developers.google.com/oauthplayground/)

### Step 2: Find YouTube Data API v3

1. **Scroll down** on the left panel to find **"YouTube Data API v3"**
2. Click the **arrow** to expand it
3. You'll see several scopes listed

### Step 3: Select the Upload Scope

Check the box for:
```
https://www.googleapis.com/auth/youtube.upload
```

This is the permission that allows uploading videos.

### Step 4: Configure Settings (Important!)

Before authorizing, click the **gear icon** in the top right corner:

- **Use your own OAuth credentials**: Toggle this ON
- Enter your OAuth Client ID and Client Secret

{: .note }
> See [Quick OAuth Setup]({{ site.baseurl }}/youtube/quick-oauth/) if you don't have credentials yet.

### Step 5: Authorize APIs

1. Click the blue **"Authorize APIs"** button
2. You'll be redirected to Google login
3. Choose your Google account
4. Click **"Allow"** to grant permissions

### Step 6: Exchange Code for Token

1. After authorization, you'll return to the playground
2. The page will show "Authorization code"
3. Click **"Exchange authorization code for tokens"** button
4. The page will now show your tokens

### Step 7: Copy the Tokens

Look for the response:
```json
{
  "access_token": "ya29.a0AfB_byC...",
  "expires_in": 3599,
  "refresh_token": "1//0...",
  ...
}
```

Copy both:
- **Access token**: The long string starting with `ya29.`
- **Refresh token**: The string starting with `1//`

### Step 8: Paste into Obsidian

1. Go to Obsidian
2. Settings > Community Plugins > Auto Uploader (gear icon)
3. Paste the access token into **"YouTube Access Token"** field
4. Paste the refresh token into **"YouTube Refresh Token"** field
5. Save!

---

## Getting OAuth Credentials (If Needed)

### 1. Create a Google Cloud Project
- Go to: [Google Cloud Console](https://console.cloud.google.com/)
- Click **"Create Project"**
- Name it (e.g., "Obsidian AutoUploader")

### 2. Enable YouTube Data API
- In your project, go to **"APIs & Services"** > **"Library"**
- Search for **"YouTube Data API v3"**
- Click **"Enable"**

### 3. Create OAuth Credentials
- Go to **"APIs & Services"** > **"Credentials"**
- Click **"Create Credentials"** > **"OAuth client ID"**
- Choose **"Desktop app"** or **"Web application"**
- If web app, add redirect URI: `https://developers.google.com/oauthplayground`
- Click **"Create"**
- Copy your **Client ID** and **Client Secret**

---

## Token Types

| Token Type | Purpose | Expiration |
|:-----------|:--------|:-----------|
| Access Token | Actual API authentication | 1 hour |
| Refresh Token | Get new access tokens | Long-lived |

### How They Work

1. **Access token** authenticates your API calls
2. When it expires, the plugin uses the **refresh token** to get a new access token
3. This happens automatically - no user intervention needed!

---

## Important Notes

### Token Expiration

- Access tokens from OAuth Playground expire in **1 hour**
- With a refresh token, the plugin auto-renews access
- For long-term use, always include the refresh token

### Quick Testing Option

For quick testing, you can:
1. Skip the "Use your own OAuth credentials" step
2. Use Google's default credentials
3. Get a 1-hour token quickly
4. Renew it when it expires

{: .warning }
> Without your own credentials, you may hit rate limits or permission issues.

### Production Use

For long-term use:
- Use your own OAuth credentials
- Request both access_token AND refresh_token
- The plugin handles token refresh automatically

---

## Troubleshooting

### "Error: invalid_grant"

- Your authorization code expired
- Click "Authorize APIs" again to get a new code

### "Error: invalid_client"

- Your Client ID or Secret is wrong
- Double-check the credentials from Google Cloud Console

### Token expired during upload

- If you have a refresh token, it should auto-refresh
- If not, generate a new token from OAuth Playground
- Paste it into plugin settings
- Try uploading again

### 403 Forbidden

- Your token doesn't have the right scope
- Make sure you selected `youtube.upload` scope
- Re-authorize with the correct scope

---

## Security Tips

1. **Never share your tokens** - They grant access to your YouTube account
2. **Store securely** - Obsidian stores them in plugin settings
3. **Revoke if compromised** - Go to [Google Account Permissions](https://myaccount.google.com/permissions)
4. **Use refresh tokens** - They allow auto-renewal without re-authenticating
