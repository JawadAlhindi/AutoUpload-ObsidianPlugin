---
title: Quick Video Test
layout: default
parent: Guides
nav_order: 3
---

# Quick Video Upload Test
{: .no_toc }

Fast video upload testing with YouTube.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Step 1: Install Plugin to Obsidian

### Find Your Vault

Your Obsidian vault is typically in:
- `C:\Users\YourName\Documents\YourVault`
- Or wherever you created your vault

### Copy Plugin Files

**PowerShell Command:**
```powershell
# Replace with YOUR vault path!
$vaultPath = "C:\Path\To\Your\Vault"
$pluginPath = "$vaultPath\.obsidian\plugins\auto-uploader"

# Create plugin folder
New-Item -ItemType Directory -Force -Path $pluginPath

# Copy files
Copy-Item "manifest.json" $pluginPath
Copy-Item "main.js" $pluginPath
```

**Manual Copy:**
1. Navigate to your vault folder
2. Go to `.obsidian\plugins\` folder
3. Create folder: `auto-uploader`
4. Copy `manifest.json` and `main.js` into it

---

## Step 2: Enable Plugin in Obsidian

1. Open Obsidian
2. Go to **Settings** (gear icon)
3. Click **Community plugins**
4. Turn OFF **Restricted mode** (if enabled)
5. Find **Auto Uploader** in installed plugins
6. Toggle it **ON**

---

## Step 3: Add YouTube Tokens

1. In Settings, click the **gear icon** next to Auto Uploader
2. Fill in the fields:

| Field | Value |
|:------|:------|
| Watch Folder | `auto-upload/` |
| YouTube Access Token | Your access token (`ya29...`) |
| YouTube Refresh Token | Your refresh token (`1//0...`) |

{: .note }
> Need tokens? See the [Quick OAuth Setup Guide]({{ site.baseurl }}/youtube/quick-oauth/).

---

## Step 4: Test Video Upload

### Create Watch Folder

1. In Obsidian's file explorer (left sidebar)
2. Right-click > **New folder**
3. Name it: `auto-upload`

### Prepare a Test Video

- Find a small video file (MP4, MOV, or M4V)
- Keep it under 50MB for quick testing
- Example: short screen recording, phone video

### Upload Test

1. **Open a note** in Obsidian
2. **Position your cursor** where you want the link
3. **Drag and drop** the video into `auto-upload/` folder
   - Use the folder view on the left
   - DON'T drag into the editor
4. **Wait** - upload will start
5. The YouTube URL should appear at your cursor!

---

## Expected Result

You should see:

1. Notification: "Uploading..."
2. After upload completes (~10-30 seconds):
   - YouTube link appears: `https://youtu.be/VIDEO_ID`
   - Notification: "Uploaded: your-video.mp4"
3. Video is **unlisted** on YouTube (not public)

---

## Troubleshooting

### Plugin doesn't appear

- Make sure `main.js` and `manifest.json` are in correct folder
- Restart Obsidian completely

### Upload fails

Open Developer Console: **Ctrl+Shift+I**

Look for error messages:
- Token expired: Get new token from OAuth Playground
- Wrong token: Verify you copied the full token
- Network issues: Check internet connection

### File not detected

- Drop file **into the folder**, not the editor
- File must be in `auto-upload/` folder
- Supported formats: `.mp4`, `.mov`, `.m4v`

### Link doesn't appear

- Make sure you have a note open
- Click in editor to position cursor before dropping file

---

## Video File Size Limits

| Limit | Size |
|:------|:-----|
| YouTube API | Up to 256GB |
| Recommended for testing | Under 50MB |
| First test | 5-10MB video |

Smaller files = faster uploads for testing.

---

## Next Steps After Testing

1. Test with different video formats (MP4, MOV)
2. Test with larger files
3. Check your YouTube channel (Videos > Unlisted)
4. Set up R2 for image uploads
5. Start using it for real!

---

## Token Refresh

Remember: Access tokens expire in 1 hour.

With a refresh token, the plugin auto-renews. If you only have an access token:

1. Go back to OAuth Playground
2. Click **"Refresh access token"**
3. Copy the new access token
4. Update in plugin settings
