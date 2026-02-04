---
title: Quick Start
layout: default
parent: Getting Started
nav_order: 2
---

# Quick Start Guide
{: .no_toc }

Get up and running in 2 minutes.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## For Users (2 minutes)

### Step 1: Get OAuth Credentials (One-time)

1. Go to: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Project"** > Name it anything > **"Create"**
3. Click **"Enable APIs and Services"** > Search "youtube" > Enable **"YouTube Data API v3"**
4. Click **"Create Credentials"** > **"OAuth client ID"**
5. If asked, configure consent screen:
   - User Type: **"External"**
   - App name: anything you want
   - Your email twice
   - **"Save and Continue"** (click 3 times)
6. Application type: **"Desktop app"**
7. **"Create"** > Save the Client ID and Client Secret

### Step 2: Get Your Tokens (30 seconds)

1. **Open `auth-helper.html`** in your browser (double-click it!)
2. **Paste** your Client ID and Client Secret
3. Click **"Authorize YouTube Access"**
4. Sign in with Google > Click **"Allow"**
5. **Copy the code** that appears > Paste into the helper
6. Click **"Get Tokens"**
7. **Copy both tokens** > Paste into Obsidian settings

**Done!** Upload videos instantly!

---

## For Developers

### Option 1: Use Auth Helper (Recommended)

- Give users the `auth-helper.html` file
- They follow the 2-step guide above
- No coding needed!

### Option 2: Provide Your Own OAuth App

- Create one OAuth app for all users
- Put credentials in `src/youtubeAuth.ts`
- Users just click "Authorize" button

{: .warning }
> Client secret must be kept secure

### Option 3: Fork and Customize

- Users create their own OAuth app
- Use the auth helper for easy token generation
- Maximum security

---

## Why This is Simple

**For Users:**
- One HTML file to open
- Clear step-by-step
- Copy-paste tokens
- Works forever (auto-refresh)

**For Developers:**
- No backend needed
- No server to maintain
- Pure client-side OAuth
- Include auth-helper.html in releases

---

## Quick Start Test

1. Open `auth-helper.html` in browser
2. Use the test steps to see the interface
3. Beautiful UI, super clear instructions
4. Works on any OS (it's just HTML!)
