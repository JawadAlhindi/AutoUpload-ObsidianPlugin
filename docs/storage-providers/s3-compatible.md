---
title: S3-Compatible Storage
layout: default
parent: Storage Providers
nav_order: 2
---

# S3-Compatible Storage Setup
{: .no_toc }

Universal setup guide for S3-compatible storage providers.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Supported Providers

The Auto Uploader plugin supports any S3-compatible storage service:

| Provider | Endpoint Example | Notes |
|:---------|:-----------------|:------|
| **AWS S3** | `https://s3.amazonaws.com` | Industry standard |
| **Hetzner** | `https://fsn1.your-objectstorage.com` | European provider |
| **Supabase** | `https://xxx.supabase.co/storage/v1/s3` | Developer-focused |
| **MinIO** | `http://localhost:9000` | Self-hosted |
| **Backblaze B2** | `https://s3.us-west-000.backblazeb2.com` | Budget-friendly |
| **DigitalOcean Spaces** | `https://nyc3.digitaloceanspaces.com` | Simple pricing |

---

## General Setup Steps

### Step 1: Create a Bucket

In your provider's dashboard:
1. Navigate to object storage / S3 section
2. Create a new bucket
3. Note the bucket name and region
4. Configure public access if needed

### Step 2: Get API Credentials

You'll need:
- **Access Key ID** - Your API key identifier
- **Secret Access Key** - Your API secret
- **Endpoint URL** - Provider-specific URL
- **Region** - Usually required (e.g., `us-east-1`)

### Step 3: Configure the Plugin

1. Open Obsidian Settings
2. Go to Community plugins > Auto Uploader > Settings
3. Select **"S3 / Hetzner / Supabase / Generic S3"** as Image Provider
4. Fill in your credentials

---

## Plugin Settings

| Setting | Description | Required |
|:--------|:------------|:---------|
| Endpoint URL | Provider's S3 endpoint | Yes |
| Region | Storage region | Yes (default: `us-east-1`) |
| Bucket Name | Your bucket name | Yes |
| Access Key ID | API key ID | Yes |
| Secret Access Key | API secret | Yes |
| Public Domain | Custom domain for URLs | No |
| Force Path Style | Use path-style URLs | No (for MinIO) |

---

## Provider-Specific Guides

### AWS S3

**Endpoint:** Not required (uses default AWS endpoints)

**Region:** Select your bucket's region (e.g., `us-east-1`, `eu-west-1`)

**Credentials:**
1. Go to AWS Console > IAM > Users
2. Create a user with S3 access
3. Generate Access Key ID and Secret

**Settings:**
```
Endpoint URL: (leave empty or use https://s3.amazonaws.com)
Region: us-east-1
Bucket Name: my-obsidian-bucket
Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

### Hetzner Object Storage

**Endpoint:** `https://fsn1.your-objectstorage.com` (varies by location)

**Region:** Use `eu-central` or as specified by Hetzner

**Credentials:**
1. Go to Hetzner Cloud Console
2. Navigate to Object Storage
3. Create credentials for your bucket

**Settings:**
```
Endpoint URL: https://fsn1.your-objectstorage.com
Region: eu-central
Bucket Name: obsidian-uploads
Access Key ID: your-access-key
Secret Access Key: your-secret-key
```

---

### Supabase Storage

**Endpoint:** `https://[project-id].supabase.co/storage/v1/s3`

**Region:** Use your project's region

**Credentials:**
1. Go to Supabase Dashboard > Settings > API
2. Get your project URL and service key
3. Create S3 credentials in Storage settings

**Settings:**
```
Endpoint URL: https://xxxxx.supabase.co/storage/v1/s3
Region: us-east-1
Bucket Name: obsidian
Access Key ID: your-access-key
Secret Access Key: your-secret-key
```

{: .note }
> Supabase requires bucket to be set as "public" for direct URL access.

---

### MinIO (Self-Hosted)

**Endpoint:** Your MinIO server URL (e.g., `http://localhost:9000`)

**Region:** `us-east-1` (default)

**Important:** Enable **Force Path Style** for MinIO!

**Credentials:**
1. Access MinIO Console
2. Create an access key
3. Note the endpoint URL

**Settings:**
```
Endpoint URL: http://your-minio-server:9000
Region: us-east-1
Bucket Name: obsidian
Access Key ID: minioadmin
Secret Access Key: minioadmin
Force Path Style: ON (important!)
```

---

### Backblaze B2

**Endpoint:** `https://s3.[region].backblazeb2.com`

**Region:** Your B2 region (e.g., `us-west-000`)

**Credentials:**
1. Go to Backblaze B2 > App Keys
2. Create a new application key
3. Note the keyID and applicationKey

**Settings:**
```
Endpoint URL: https://s3.us-west-000.backblazeb2.com
Region: us-west-000
Bucket Name: obsidian-uploads
Access Key ID: your-key-id
Secret Access Key: your-application-key
```

---

## Troubleshooting

### "Access Denied" Error

- Check that credentials are correct
- Verify bucket permissions allow writes
- Ensure Access Key has proper IAM permissions

### "Bucket Not Found" Error

- Verify bucket name is spelled correctly (case-sensitive)
- Check that bucket exists in the specified region
- Ensure endpoint URL matches bucket location

### "Invalid Endpoint" Error

- Verify endpoint URL format
- Include `https://` prefix
- Check provider documentation for correct endpoint

### Images Not Publicly Accessible

- Enable public access on bucket
- Configure bucket policy for public reads
- Use Public Domain setting if you have a custom domain

### MinIO Connection Issues

- Enable **Force Path Style** option
- Verify MinIO server is accessible
- Check firewall/network settings

---

## Security Best Practices

1. **Use IAM policies** to restrict access to specific buckets
2. **Enable versioning** for backup protection
3. **Set up lifecycle rules** to manage storage costs
4. **Use HTTPS** for all connections
5. **Rotate credentials** periodically
6. **Never commit credentials** to version control

---

## Public URL Configuration

### Option 1: Provider Default URLs

Most providers generate public URLs automatically:
- AWS: `https://bucket.s3.region.amazonaws.com/file.png`
- Hetzner: `https://bucket.fsn1.your-objectstorage.com/file.png`

### Option 2: Custom Domain

1. Set up a CNAME record pointing to your bucket
2. Configure SSL/TLS (usually via CDN)
3. Enter the custom domain in plugin settings

**Example:**
```
Public Domain: https://media.yourdomain.com
```

Files will be accessible at: `https://media.yourdomain.com/file.png`

---

## Cost Comparison

| Provider | Storage | Egress | Best For |
|:---------|:--------|:-------|:---------|
| AWS S3 | $0.023/GB | $0.09/GB | Enterprise |
| Cloudflare R2 | $0.015/GB | **Free** | High traffic |
| Hetzner | €0.005/GB | €0.01/GB | EU users |
| Backblaze B2 | $0.006/GB | $0.01/GB | Budget |
| MinIO | Self-hosted | Self-hosted | Full control |

{: .tip }
> For high-traffic sites, Cloudflare R2's free egress can save significant costs.
