---
title: OAuth Setup
layout: default
parent: YouTube Integration
nav_order: 1
---

# YouTube OAuth Setup
{: .no_toc }

Complete guide for setting up YouTube OAuth authentication.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Quick Start (Manual Token Entry)

The fastest way to get started:

1. Open plugin settings in Obsidian
2. Paste your tokens from OAuth Playground:
   - **YouTube Access Token**: `ya29.a0...`
   - **YouTube Refresh Token**: `1//04...`
3. Save settings
4. Test upload - token will auto-refresh when it expires!

---

## Full Setup: One-Click OAuth Button

To enable the "Authorize YouTube" button in settings:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name it: "Obsidian AutoUploader"
4. Click **Create**

### Step 2: Enable YouTube Data API

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click on it, then click **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: "Obsidian AutoUploader"
   - Support email: your email
   - Add your email to test users
   - Save
4. Back to Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: "Obsidian Plugin"
   - Click **Create**
5. **Copy the Client ID and Client Secret**

### Step 4: Configure Plugin

1. Open `src/youtubeAuth.ts`
2. Replace the placeholder values:

```typescript
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE";
```

With your actual credentials:

```typescript
const CLIENT_ID = "123456-abcdef.apps.googleusercontent.com";
const CLIENT_SECRET = "GOCSPX-your-secret-here";
```

3. Save the file
4. Rebuild: `npm run build`
5. Copy to Obsidian vault

### Step 5: Use the Button!

Now in Obsidian settings:
1. Click **"Authorize YouTube"** button
2. Browser opens with OAuth Playground
3. Follow instructions to get tokens
4. Paste tokens into the fields
5. Done! Tokens will auto-refresh

---

## Alternative: Direct Google OAuth

For browser extensions style authentication (no Playground needed):

### Step 1: Create OAuth App

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** > **"OAuth client ID"**

If asked to configure consent screen:
- Click **"Configure Consent Screen"**
- User Type: **"External"** > **"Create"**
- App name: **"Obsidian Uploader"**
- User support email: your Gmail
- Developer email: your Gmail
- **"Save and Continue"** (3 times)
- **"Back to Dashboard"**

Then create OAuth Client:
1. Application type: **"Desktop app"**
2. Name: **"Obsidian"**
3. Click **"Create"**
4. **Download JSON** (save it)

### Step 2: Get Token Using Browser

Go to this URL (replace YOUR_CLIENT_ID):

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline&prompt=consent
```

1. Sign in with your Google account
2. Click **"Allow"**
3. Copy the code that appears
4. Exchange for tokens in the plugin

---

## Current Status

| Feature | Status |
|:--------|:-------|
| Automatic token refresh | Working |
| One-click button | Requires OAuth app setup |
| Manual token entry | Ready to use immediately |

---

## Recommended: Use Manual Entry for Now

The easiest way to get started:

1. **Get tokens from OAuth Playground** (see [Quick OAuth Guide]({{ site.baseurl }}/youtube/quick-oauth/))
2. **Paste both tokens** into settings (access + refresh)
3. **Test it** - upload a video
4. **Token auto-refreshes** when it expires

Later, you can set up the OAuth app for the button if you want.
