---
title: YouTube Integration
layout: default
nav_order: 4
has_children: true
permalink: /youtube/
---

# YouTube Integration

Upload videos directly to YouTube from your Obsidian vault.

---

## Overview

The Auto Uploader plugin supports uploading videos to YouTube using OAuth 2.0 authentication. Videos are uploaded as **Unlisted** by default, meaning they won't appear in search results but can be shared via link.

## Features

- **Automatic Upload** - Drop videos in watch folder for instant upload
- **Unlisted Privacy** - Videos are not publicly searchable
- **Token Refresh** - Automatic authentication renewal
- **Link Insertion** - YouTube URLs inserted at cursor position

## Supported Formats

- `.mp4` - Most common video format
- `.mov` - Apple QuickTime format
- `.m4v` - iTunes video format

---

## Setup Options

There are multiple ways to set up YouTube authentication:

### Option 1: Quick OAuth Setup (Recommended)
5-minute setup using Google OAuth Playground with your own credentials.

[Quick OAuth Setup Guide]({{ site.baseurl }}/youtube/quick-oauth/)

### Option 2: Full OAuth Setup
Complete setup with one-click authorization button in plugin settings.

[Full OAuth Setup Guide]({{ site.baseurl }}/youtube/oauth-setup/)

### Option 3: Token Reference
Detailed guide for understanding and managing OAuth tokens.

[Token Guide]({{ site.baseurl }}/youtube/token-guide/)

---

## How It Works

```
1. Authenticate with Google (one-time setup)
2. Plugin receives access token and refresh token
3. Drop video file into watch folder
4. Plugin uploads to YouTube via API
5. Short YouTube URL (youtu.be/...) inserted at cursor
6. Token auto-refreshes when expired
```

---

## Important Notes

{: .warning }
> YouTube API has daily upload quotas. For heavy usage, monitor your quota in Google Cloud Console.

{: .note }
> Videos uploaded via API are set to Unlisted by default. You can change privacy settings on YouTube after upload.
