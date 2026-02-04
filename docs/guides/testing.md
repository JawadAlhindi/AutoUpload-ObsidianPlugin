---
title: Testing Guide
layout: default
parent: Guides
nav_order: 1
---

# Comprehensive Testing Guide
{: .no_toc }

Full testing workflow for the Auto Uploader plugin.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Plugin

**Development mode (auto-rebuild on changes):**
```bash
npm run dev
```

**Production build (one-time):**
```bash
npm run build
```

### 3. Install Plugin in Obsidian

#### Option A: Symlink (Recommended for Development)

Find your vault's plugins folder: `<YourVault>/.obsidian/plugins/`

**Windows (PowerShell as Administrator):**
```powershell
New-Item -ItemType SymbolicLink -Path "C:\Path\To\YourVault\.obsidian\plugins\auto-uploader" -Target "C:\Path\To\AutoUploader-Plugin"
```

#### Option B: Manual Copy

Copy these files to your vault's plugins folder:
- `manifest.json`
- `main.js`
- `styles.css` (if exists)

```powershell
$vaultPlugins = "C:\Path\To\YourVault\.obsidian\plugins\auto-uploader"
Copy-Item "manifest.json" $vaultPlugins
Copy-Item "main.js" $vaultPlugins
```

### 4. Enable Plugin

1. Open Obsidian
2. Go to **Settings** > **Community plugins**
3. Disable **Restricted Mode** if prompted
4. Find **Auto Uploader** and toggle **ON**

### 5. Configure the Plugin

In Settings > Community plugins > Auto Uploader (gear icon):

| Setting | Value |
|:--------|:------|
| Watch Folder | `auto-upload/` |
| Image Provider | Your choice (R2 or S3) |
| Provider Credentials | Your API keys |

---

## Testing Image Upload

1. **Create the watch folder** in your vault (e.g., `auto-upload/`)
2. **Open a note** in Obsidian
3. **Drag and drop** an image file into the `auto-upload/` folder
4. **The plugin should:**
   - Detect the new file
   - Upload it to your provider
   - Insert the URL at your cursor position
   - Show a notification

**Supported image formats:** PNG, JPG, JPEG, GIF, WebP, HEIC

---

## Testing Video Upload

1. Configure YouTube credentials in settings
2. Drag and drop a video file into the `auto-upload/` folder
3. **The plugin should:**
   - Detect the new file
   - Upload it to YouTube (unlisted)
   - Insert the YouTube URL at your cursor
   - Show a notification

**Supported video formats:** MP4, MOV, M4V

---

## Troubleshooting

### Plugin doesn't show up

- Make sure you've built the plugin (`npm run dev` or `npm run build`)
- Check that `main.js` exists in the plugin folder
- Restart Obsidian completely

### Build errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Upload fails

1. **Check the browser console** (Ctrl+Shift+I in Obsidian)
2. Common issues:
   - **Invalid API keys**: Double-check credentials
   - **Network issues**: Check internet connection
   - **File too large**: Check provider limits
   - **Quota exceeded**: YouTube has daily limits

### File not detected

- Make sure file is in the correct watch folder
- Check that file extension is supported
- Try dragging directly into folder view (not editor)

### Cursor position issues

- Make sure you have an active note open
- Cursor must be visible in the editor
- Plugin inserts at current cursor position

---

## Development Workflow

### Make Changes and Test

1. Keep `npm run dev` running in a terminal
2. Make changes to TypeScript files
3. Wait for build to complete
4. Reload Obsidian plugin:
   - Open Command Palette (Ctrl+P)
   - Type "reload app without saving"
   - Or toggle plugin off and on

### Check Logs

Open Developer Console in Obsidian: **Ctrl+Shift+I**

Look for errors or console.log output.

### Debug Mode

Add console.log statements in your code:

```typescript
console.log("Upload started:", file.name);
console.log("Upload result:", url);
```

---

## Test Checklist

### Basic Tests
- [ ] Plugin loads without errors
- [ ] Settings page displays correctly
- [ ] Watch folder is monitored

### Image Upload Tests
- [ ] PNG upload works
- [ ] JPG upload works
- [ ] GIF upload works
- [ ] WebP upload works
- [ ] URL is accessible
- [ ] Link inserted at cursor

### Video Upload Tests
- [ ] MP4 upload works
- [ ] MOV upload works
- [ ] YouTube URL is correct format
- [ ] Video is unlisted

### Error Handling Tests
- [ ] Invalid credentials show error
- [ ] Network failure handled gracefully
- [ ] Unsupported file type ignored

---

## Next Steps

Once basic functionality works:

1. Add support for additional providers
2. Implement retry logic for failed uploads
3. Add upload progress indicators
4. Option to delete local file after upload
5. Better error messages
