---
title: Quick R2 Test
layout: default
parent: Guides
nav_order: 2
---

# Quick R2 Testing Guide
{: .no_toc }

Fast image upload testing with Cloudflare R2.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Step 1: Build the Plugin

If you need to rebuild:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run dev
```

---

## Step 2: Install Plugin in Obsidian

1. Find your Obsidian vault's plugins folder:
   - Usually: `C:\Users\YourName\Documents\YourVault\.obsidian\plugins\`

2. Create a folder: `auto-uploader` (if it doesn't exist)

3. Copy these files:
   - `manifest.json`
   - `main.js`
   - `auth-helper.html` (optional, for YouTube)

**PowerShell command:**
```powershell
$vaultPath = "C:\Path\To\YourVault\.obsidian\plugins\auto-uploader"
New-Item -ItemType Directory -Force -Path $vaultPath
Copy-Item "manifest.json" $vaultPath
Copy-Item "main.js" $vaultPath
Copy-Item "auth-helper.html" $vaultPath
```

---

## Step 3: Enable Plugin

1. Open Obsidian
2. Go to **Settings** > **Community plugins**
3. Disable **Restricted Mode** (if prompted)
4. Find **Auto Uploader** and toggle **ON**

---

## Step 4: Configure R2 Storage

1. Go to Settings > Community plugins > Auto Uploader (gear icon)
2. Under **Image Provider**, select **"Cloudflare R2"**
3. Fill in your R2 credentials:

| Field | Value |
|:------|:------|
| Account ID | Your Cloudflare Account ID |
| Bucket Name | Your R2 bucket name |
| Access Key ID | Your R2 API token access key |
| Secret Access Key | Your R2 API token secret key |
| Public Domain | Custom domain (optional) |
| Public URL | R2.dev URL (optional) |

{: .note }
> Need R2 credentials? See the [Cloudflare R2 Setup Guide]({{ site.baseurl }}/storage-providers/cloudflare-r2/).

---

## Step 5: Test Image Upload

1. **Create the watch folder** in your vault:
   - Create a folder named `auto-upload`

2. **Open a note** where you want the image link inserted

3. **Add an image to the watch folder**:
   - Drag and drop an image (PNG, JPG, GIF, WebP) into `auto-upload/`
   - Or copy/paste an image file into that folder

4. **Watch for the upload**:
   - Notice: "Detected file in auto-upload folder: [filename]"
   - Then: "Uploading image: [filename]"
   - Finally: "Uploaded: [filename]"
   - The image URL appears at your cursor!

---

## Step 6: Verify Upload

1. Check that the URL was inserted in your note
2. Click the URL to verify the image is accessible
3. Check console (Ctrl+Shift+I) for any errors

---

## Troubleshooting

### Plugin Not Showing Up

- Make sure `main.js` exists in the plugin folder
- Restart Obsidian completely
- Check that the plugin is enabled

### Upload Fails

- **Check credentials**: Verify all R2 settings are correct
- **Check console**: Press Ctrl+Shift+I for error messages
- **Verify permissions**: API token needs "Object Read & Write"
- **Check public access**: Enable in R2 bucket settings

### File Not Detected

- File must be in the watch folder (default: `auto-upload/`)
- Check file extension is supported (png, jpg, jpeg, gif, webp)
- Try dragging into folder view, not note editor

### URL Not Inserted

- Make sure you have a note open with cursor visible
- Plugin inserts at current cursor position
- Check console for errors

---

## Development Testing

If making changes:

1. Keep `npm run dev` running
2. Make code changes
3. Wait for build to complete
4. In Obsidian: Ctrl+P > "Reload app without saving"
5. Test again!

---

## What to Test

| Test | Expected Result |
|:-----|:----------------|
| PNG upload | URL inserted, image accessible |
| JPG upload | URL inserted, image accessible |
| GIF upload | URL inserted, animation works |
| WebP upload | URL inserted, image accessible |
| Invalid credentials | Error message shown |
| Multiple files | Each uploaded sequentially |
