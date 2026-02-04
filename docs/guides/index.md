---
title: Guides
layout: default
nav_order: 5
has_children: true
permalink: /guides/
---

# Guides

Step-by-step guides for testing and using Auto Uploader.

---

## Available Guides

### Testing Guides

- [Comprehensive Testing Guide]({{ site.baseurl }}/guides/testing/) - Full testing workflow for developers
- [Quick R2 Test]({{ site.baseurl }}/guides/quick-r2-test/) - Fast image upload testing with Cloudflare R2
- [Quick Video Test]({{ site.baseurl }}/guides/quick-video-test/) - Fast video upload testing with YouTube

---

## Quick Test Checklist

### Before Testing

- [ ] Plugin installed in Obsidian
- [ ] Plugin enabled (toggle ON)
- [ ] Credentials configured
- [ ] Watch folder created (`auto-upload/`)

### Basic Tests

- [ ] Upload a PNG image
- [ ] Upload a JPG image
- [ ] Upload a GIF
- [ ] Verify URL is accessible
- [ ] Check link inserted at cursor

### Advanced Tests

- [ ] Upload video (MP4)
- [ ] Test multiple files in sequence
- [ ] Verify upload cache prevents duplicates
- [ ] Test with different file sizes

---

## Development Workflow

If you're contributing to the plugin:

1. Run `npm run dev` for auto-rebuild
2. Make code changes
3. Reload Obsidian plugin (Ctrl+P > "Reload app without saving")
4. Test your changes
5. Check console (Ctrl+Shift+I) for errors

---

## Getting Help

If tests fail:

1. Check the [Troubleshooting]({{ site.baseurl }}/troubleshooting/) page
2. Open Developer Console (Ctrl+Shift+I) for error messages
3. Verify all credentials are correct
4. Check your internet connection
