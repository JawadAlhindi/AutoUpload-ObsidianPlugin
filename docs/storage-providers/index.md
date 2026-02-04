---
title: Storage Providers
layout: default
nav_order: 3
has_children: true
permalink: /storage-providers/
---

# Storage Providers

Auto Uploader supports multiple cloud storage providers for your images.

---

## Available Providers

### Cloudflare R2

S3-compatible storage with no egress fees. Recommended for most users due to cost-effectiveness and global CDN.

[Cloudflare R2 Setup Guide]({{ site.baseurl }}/storage-providers/cloudflare-r2/)

### S3-Compatible Storage

Universal support for any S3-compatible service:

- **AWS S3** - Industry standard
- **Hetzner Object Storage** - European provider
- **Supabase Storage** - Great for developers
- **MinIO** - Self-hosted option

[S3-Compatible Setup Guide]({{ site.baseurl }}/storage-providers/s3-compatible/)

---

## Choosing a Provider

| Provider | Best For | Cost | Setup Complexity |
|:---------|:---------|:-----|:-----------------|
| Cloudflare R2 | General use | Low (no egress) | Easy |
| AWS S3 | Enterprise | Variable | Medium |
| Hetzner | EU compliance | Low | Easy |
| MinIO | Self-hosted | Free | Medium |

---

## Quick Comparison

### Cloudflare R2
- No egress fees (free data transfer out)
- Global CDN included
- S3-compatible API
- Pay-as-you-go pricing

### AWS S3
- Industry standard
- Extensive documentation
- More complex pricing
- Regional data centers

### Self-Hosted (MinIO)
- Full control over data
- No ongoing costs
- Requires server maintenance
- Path-style URL support
