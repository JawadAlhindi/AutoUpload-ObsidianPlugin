---
title: Home
layout: home
nav_order: 1
description: "Auto Uploader - Automatically upload images and videos to cloud storage from Obsidian"
permalink: /
---

# Auto Uploader for Obsidian
{: .fs-9 }

Seamlessly upload images and videos to cloud storage providers directly from your Obsidian vault.
{: .fs-6 .fw-300 }

[Get Started]({{ site.baseurl }}/getting-started/){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/JawadAlhindi/AutoUploader-Obsidian-plugin){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## Features

### Cloud Storage Support

| Provider | Type | Features |
|:---------|:-----|:---------|
| **Cloudflare R2** | Images | S3-compatible, no egress fees, global CDN |
| **AWS S3** | Images | Industry standard object storage |
| **S3-Compatible** | Images | Hetzner, Supabase, MinIO, and more |
| **YouTube** | Videos | Upload as unlisted with automatic link insertion |

### Automated Workflow

- **Watch Folder** - Drop files and they upload automatically
- **Smart Links** - Markdown links inserted at cursor position
- **Token Refresh** - Automatic authentication management
- **Upload Cache** - Prevents duplicate uploads

---

## Quick Start

1. **Install the plugin** in Obsidian
2. **Configure your storage provider** (R2, S3, or YouTube)
3. **Create an `auto-upload` folder** in your vault
4. **Drop files in** - links appear automatically!

[Read the full installation guide]({{ site.baseurl }}/getting-started/installation/){: .btn .btn-outline }

---

## Supported File Types

### Images
`.png` `.jpg` `.jpeg` `.gif` `.webp` `.heic`

### Videos
`.mp4` `.mov` `.m4v`

---

## How It Works

```
1. Drop media file into watch folder
2. Plugin detects and uploads to configured provider
3. Public URL is inserted at cursor position
4. Original file is moved/cached to prevent re-upload
```

---

## About

Auto Uploader is an open-source Obsidian plugin developed by [Jawad Alhindi](https://github.com/JawadAlhindi).

This plugin is currently in active development. Features and configuration options may change.
