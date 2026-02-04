---
title: Troubleshooting
layout: default
nav_order: 6
---

# Troubleshooting
{: .no_toc }

Common issues and solutions for the Auto Uploader plugin.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Plugin Issues

### Plugin doesn't appear in Obsidian

**Symptoms:** Can't find "Auto Uploader" in installed plugins list.

**Solutions:**
1. Verify files are in correct location:
   - `YourVault\.obsidian\plugins\auto-uploader\main.js`
   - `YourVault\.obsidian\plugins\auto-uploader\manifest.json`
2. Restart Obsidian completely (close all windows)
3. Disable Restricted Mode in Settings > Community plugins
4. Check folder name is exactly `auto-uploader` (case-sensitive)

### Plugin won't enable

**Symptoms:** Toggle turns on but immediately turns off.

**Solutions:**
1. Open Developer Console (Ctrl+Shift+I)
2. Look for error messages when enabling
3. Rebuild the plugin: `npm run build`
4. Check for missing dependencies: `npm install`

---

## Upload Issues

### "Credentials are incomplete" Error

**Symptoms:** Upload fails with credentials error.

**Solutions:**
1. Check all required fields are filled:
   - For R2: Account ID, Bucket Name, Access Key ID, Secret Access Key
   - For S3: Endpoint URL, Region, Bucket Name, Access Key ID, Secret Access Key
2. Remove any extra spaces from credential fields
3. Verify credentials are valid in provider dashboard

### "Upload failed" Error

**Symptoms:** File detected but upload fails.

**Solutions:**
1. **Check credentials**: Verify in provider dashboard
2. **Check permissions**: API token needs "Object Read & Write"
3. **Check bucket**: Ensure bucket exists and name is correct
4. **Check network**: Verify internet connection
5. **Check console**: Press Ctrl+Shift+I for detailed error

### "Access Denied" or "403 Forbidden"

**Symptoms:** Upload rejected with permission error.

**Solutions:**
1. Verify API token has correct permissions
2. Check bucket policy allows writes
3. Create a new API token if current one doesn't work
4. Ensure token is associated with correct bucket

### Images Not Publicly Accessible

**Symptoms:** URL inserted but image doesn't load.

**Solutions:**
1. **R2**: Enable public access in bucket settings
2. **S3**: Configure bucket policy for public reads
3. **Custom domain**: Check DNS configuration
4. **Public URL setting**: Ensure it's correctly entered

---

## File Detection Issues

### File not detected

**Symptoms:** Drop file in watch folder but nothing happens.

**Solutions:**
1. Verify file is in the correct watch folder (default: `auto-upload/`)
2. Check file extension is supported:
   - Images: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.heic`
   - Videos: `.mp4`, `.mov`, `.m4v`
3. Try dragging into folder view, not note editor
4. Restart plugin (toggle off/on in settings)

### Duplicate uploads

**Symptoms:** Same file uploads multiple times.

**Solutions:**
1. Check upload cache is working (file should be in cache after first upload)
2. Clear upload cache in settings, then re-upload
3. Check file names - different names = different files
4. Restart Obsidian if cache seems stuck

---

## YouTube-Specific Issues

### "403 Forbidden" from YouTube

**Symptoms:** Video upload fails with 403 error.

**Solutions:**
1. **Token expired**: Get a new access token
2. **Wrong scope**: Re-authorize with `youtube.upload` scope
3. **Quota exceeded**: Check YouTube API quota in Google Cloud Console
4. **Refresh token**: Add refresh token for auto-renewal

### Token expired

**Symptoms:** Uploads worked before but now fail.

**Solutions:**
1. If you have a **refresh token**: Plugin should auto-refresh. If not working:
   - Check refresh token is entered in settings
   - Re-enter both tokens
2. If you only have **access token**:
   - Go to OAuth Playground
   - Click "Refresh access token"
   - Copy new token to plugin settings

### "invalid_grant" Error

**Symptoms:** Token refresh fails with invalid_grant.

**Solutions:**
1. Authorization code expired - click "Authorize APIs" again
2. Refresh token revoked - re-authorize completely
3. Too much time passed - complete authorization flow faster

### "invalid_client" Error

**Symptoms:** OAuth fails with client error.

**Solutions:**
1. Verify Client ID is correct
2. Verify Client Secret is correct
3. Check credentials in Google Cloud Console
4. Ensure OAuth consent screen is configured

---

## R2-Specific Issues

### "R2 credentials are incomplete"

**Solutions:**
1. Fill in all required fields:
   - Account ID
   - Bucket Name
   - Access Key ID
   - Secret Access Key
2. Account ID is found in Cloudflare dashboard URL or R2 section

### Wrong public URL

**Symptoms:** Image uploads but URL doesn't work.

**Solutions:**
1. If using **custom domain**: Enter in "Public Domain" field
2. If using **R2.dev**: Enter in "Public URL" field
3. Only fill ONE of these fields, not both
4. Include `https://` prefix

---

## Build Issues

### Build errors

**Symptoms:** `npm run build` fails.

**Solutions:**
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript errors

**Symptoms:** Build fails with TS errors.

**Solutions:**
1. Check TypeScript version matches project
2. Run `npm install` to update dependencies
3. Check for syntax errors in changed files

---

## Console Debugging

### How to Access Console

In Obsidian: **Ctrl+Shift+I** (or Cmd+Shift+I on Mac)

### What to Look For

1. **Red errors**: Critical failures
2. **Yellow warnings**: Potential issues
3. **Plugin logs**: Messages starting with "Auto Uploader"

### Common Console Messages

| Message | Meaning | Action |
|:--------|:--------|:-------|
| `Detected file in auto-upload folder` | File found | Wait for upload |
| `Uploading image/video` | Upload started | Wait for completion |
| `Uploaded: filename` | Success | URL should appear |
| `R2 upload failed` | Upload error | Check credentials |
| `Token refresh failed` | Auth error | Re-authorize |

---

## Getting More Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Check console for error messages
4. Note your Obsidian version and OS

### Reporting Issues

When reporting a bug, include:
1. Obsidian version
2. Plugin version
3. Operating system
4. Console error messages
5. Steps to reproduce

### Resources

- [GitHub Issues](https://github.com/JawadAlhindi/AutoUploader-Obsidian-plugin/issues)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [YouTube API Docs](https://developers.google.com/youtube/v3)
