---
title: Quick OAuth Setup
layout: default
parent: YouTube Integration
nav_order: 2
---

# Quick OAuth Setup
{: .no_toc }

5-minute setup for full YouTube API access.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Step 1: Create Google Cloud Project (2 min)

1. Go to: [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** > **"New Project"**
3. Project name: **"Obsidian Uploader"**
4. Click **"Create"**
5. Wait for project to be created

---

## Step 2: Enable YouTube API (1 min)

1. In your new project, click **"APIs & Services"** in left menu
2. Click **"Enable APIs and Services"** (big button at top)
3. Search for: **"YouTube Data API v3"**
4. Click on it > Click **"Enable"**

---

## Step 3: Create OAuth Credentials (2 min)

1. Click **"Credentials"** in left menu
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted to configure consent screen:
   - Click **"Configure Consent Screen"**
   - Select **"External"** > **"Create"**
   - App name: **"Obsidian Uploader"**
   - User support email: **your email**
   - Developer contact: **your email**
   - Click **"Save and Continue"**
   - Click **"Add or Remove Scopes"**
   - In "Manually add scopes", paste: `https://www.googleapis.com/auth/youtube.upload`
   - Click **"Add to Table"** > **"Update"** > **"Save and Continue"**
   - Under "Test users", click **"Add Users"**
   - Add your email > **"Save"** > **"Save and Continue"**
   - Click **"Back to Dashboard"**
4. Now go back to **"Credentials"** > **"Create Credentials"** > **"OAuth client ID"**
5. Application type: **"Web application"**
6. Name: **"Obsidian Plugin"**
7. Under **"Authorized redirect URIs"**, click **"Add URI"**
8. Paste: `https://developers.google.com/oauthplayground`
9. Click **"Create"**
10. **COPY the Client ID and Client Secret** (save them somewhere)

---

## Step 4: Get Token with YOUR credentials

1. Go to: [OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the **gear icon** in top right
3. Check **"Use your own OAuth credentials"**
4. Paste your **Client ID** and **Client Secret**
5. Click **"Close"**
6. On the left, find **"YouTube Data API v3"**
7. Check: `https://www.googleapis.com/auth/youtube.upload`
8. Click **"Authorize APIs"**
9. Sign in with your Google account
10. Click **"Allow"** (you might see a warning - click "Continue")
11. Click **"Exchange authorization code for tokens"**
12. **COPY both tokens**:
    - Access token: `ya29...`
    - Refresh token: `1//0...`

---

## Step 5: Use in Obsidian

1. Open Obsidian > Settings > Auto Uploader
2. Paste both tokens
3. Save
4. **Try uploading now!**

---

## Why This Works

| Method | Result |
|:-------|:-------|
| OAuth Playground with Google's credentials | Limited permissions |
| OAuth Playground with YOUR credentials | Full access |

Your refresh token will also work for auto-refresh!

**Total time: ~5 minutes**
