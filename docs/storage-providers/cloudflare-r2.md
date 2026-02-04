---
title: Cloudflare R2
layout: default
parent: Storage Providers
nav_order: 1
---

# Cloudflare R2 Setup Guide
{: .no_toc }

Complete guide for setting up Cloudflare R2 storage for automatic image uploads.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## What is Cloudflare R2?

Cloudflare R2 is an S3-compatible object storage service that offers:
- **No egress fees** - Free data transfer out
- **S3-compatible API** - Works with existing S3 tools
- **Global CDN** - Fast access worldwide
- **Pay-as-you-go** - Only pay for storage used

## Prerequisites

- A Cloudflare account (free tier works)
- Access to Cloudflare dashboard

---

## Step 1: Create an R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **"Create bucket"**
4. Enter a bucket name (e.g., `obsidian-images`)
5. Choose a location (optional, defaults to automatic)
6. Click **"Create bucket"**

{: .note }
> Note your bucket name - you'll need it later!

---

## Step 2: Get Your Account ID

1. In the R2 dashboard, look at the URL or any bucket details
2. Your Account ID is visible in the dashboard (usually in the top right or in bucket URLs)
3. It looks like: `abc123def456789012345678901234567890`

{: .tip }
> Copy your Account ID - you'll need it for the plugin settings!

---

## Step 3: Create an API Token

1. In the R2 dashboard, click **"Manage R2 API Tokens"**
2. Click **"Create API token"**
3. Configure the token:
   - **Token name**: `Obsidian AutoUploader`
   - **Permissions**: Select **"Object Read & Write"**
   - **TTL**: Leave as "Never expire" (or set expiration if preferred)
   - **Bucket**: Select your bucket
4. Click **"Create API Token"**
5. Copy both the **Access Key ID** and **Secret Access Key** immediately

{: .warning }
> You won't be able to see the secret key again! Save both keys securely.

---

## Step 4: Configure Public Access

To make your images publicly accessible:

### Option A: Using Custom Domain (Recommended)

1. In your R2 bucket settings, go to **"Settings"** tab
2. Scroll to **"Public Access"** section
3. Click **"Connect Domain"** or **"Add Custom Domain"**
4. Enter your domain (e.g., `media.yourdomain.com`)
5. Follow Cloudflare's instructions to add the DNS record
6. Once connected, your images will be accessible at: `https://media.yourdomain.com/filename.png`

### Option B: Using R2.dev Subdomain

1. In your R2 bucket settings, go to **"Settings"** tab
2. Scroll to **"Public Access"** section
3. Click **"Allow Access"** to enable public access
4. Cloudflare will provide a public URL like: `https://pub-xxxxx.r2.dev`
5. Copy this URL - you'll use it in the plugin settings

---

## Step 5: Configure the Plugin

1. Open Obsidian
2. Go to **Settings** > **Community plugins** > **AutoUploader** > **Settings**
3. Under **"Image Provider"**, select **"Cloudflare R2"**
4. Fill in the following fields:

| Field | Description | Example |
|:------|:------------|:--------|
| Account ID | Your Cloudflare Account ID | `e4d5295b64a2ba0bf8cd7176968d6bea` |
| Bucket Name | Your bucket name | `obsidian-images` |
| Access Key ID | From Step 3 | `abc123...` |
| Secret Access Key | From Step 3 | `xyz789...` |
| Public Domain | Custom domain (optional) | `https://media.yourdomain.com` |
| Public URL | R2.dev URL (optional) | `https://pub-xxxxx.r2.dev` |

The endpoint will be auto-generated: `https://[AccountID].r2.cloudflarestorage.com`

---

## Step 6: Test Your Setup

1. Create a folder named `auto-upload` in your vault
2. Place an image file (PNG, JPG, etc.) in that folder
3. Open a note where you want the image link inserted
4. The plugin should automatically:
   - Detect the new file
   - Upload it to R2
   - Insert the public URL into your note

{: .tip }
> If successful, you'll see a notice saying "Uploaded: [filename]" and the image URL will appear in your note!

---

## Troubleshooting

### "R2 credentials are incomplete" Error

Make sure all required fields are filled:
- Account ID
- Bucket Name
- Access Key ID
- Secret Access Key

### "R2 upload failed" Error

- **Check API token permissions**: Make sure it has "Object Read & Write" permission
- **Verify bucket name**: Ensure it matches exactly (case-sensitive)
- **Check Account ID**: Make sure it's correct
- **Verify credentials**: Try creating a new API token if the current one doesn't work

### Images Not Accessible Publicly

- **Custom domain**: Check that DNS records are properly configured
- **R2.dev subdomain**: Make sure public access is enabled in bucket settings
- **Plugin settings**: Ensure Public Domain/URL is correctly entered

### "Access Denied" or "403 Forbidden"

- Your API token might not have the correct permissions
- Create a new token with "Object Read & Write" permissions
- Make sure the token is associated with the correct bucket

---

## Security Best Practices

1. **Keep API tokens secure**: Never share them or commit to version control
2. **Use bucket-specific tokens**: Instead of "All buckets", create tokens for specific buckets
3. **Set token expiration**: Consider setting an expiration date for your tokens
4. **Rotate tokens regularly**: Periodically create new tokens and revoke old ones
5. **Use custom domains**: Custom domains give you more control over access

---

## Cost Considerations

Cloudflare R2 pricing (as of 2024):

| Resource | Cost |
|:---------|:-----|
| Storage | $0.015 per GB/month |
| Class A Operations (writes) | $4.50 per million |
| Class B Operations (reads) | $0.36 per million |
| Egress | **FREE** (unlimited) |

For typical Obsidian usage with images:
- Storage costs are minimal (usually < $1/month for personal use)
- No egress fees mean you can share images freely
- Much cheaper than AWS S3 for high-traffic use cases

---

## Quick Reference

| Setting | Where to Find |
|:--------|:--------------|
| Account ID | R2 Dashboard > Top right or URL |
| Bucket Name | R2 Dashboard > Your bucket name |
| Access Key ID | R2 API Tokens > After creating token |
| Secret Access Key | R2 API Tokens > After creating token |
| Public Domain | R2 Bucket Settings > Custom Domain |
| Public URL | R2 Bucket Settings > Public Access > R2.dev URL |

---

## Need Help?

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- Review plugin error messages in Obsidian console (Ctrl+Shift+I)
- Verify all settings match exactly (case-sensitive)
