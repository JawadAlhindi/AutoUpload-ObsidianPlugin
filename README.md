# AutoUploader for Obsidian (still under development!)

## Overview

AutoUploader is an Obsidian plugin designed to streamline the process of uploading media files to cloud storage providers. By monitoring a designated directory within the vault, the plugin automatically detects new media files, uploads them to configured providers, and replaces the local file with a direct link in the active document.

## Features

### Video Upload
*   **Provider**: YouTube
*   **Functionality**: Automatically uploads video files placed in the watch folder to YouTube.
*   **Privacy**: Videos are uploaded with "Unlisted" privacy status by default, ensuring they are not publicly searchable but accessible via link.
*   **Authentication**: Utilizes OAuth 2.0 for secure authentication with the user's Google account.

### Image Upload
*   **Provider**: Imgur
*   **Functionality**: Automatically uploads image files placed in the watch folder to Imgur.
*   **Integration**: Returns a direct URL to the hosted image for immediate embedding in Markdown documents.

### Automated Workflow
*   **Watch Folder**: Configurable directory monitoring for seamless background processing.
*   **Link Insertion**: Automatically inserts the appropriate Markdown or HTML link at the current cursor position in the active note upon successful upload.
*   **Token Management**: Includes an automated token refresh mechanism to maintain persistent authentication sessions without user intervention.

## Configuration

### YouTube Authentication
To enable video uploads, valid OAuth 2.0 credentials are required.

1.  Navigate to the plugin settings.
2.  Click **Open Auth Helper** to launch the local authentication utility.
3.  Follow the on-screen instructions to authenticate with Google.
4.  Copy the generated **Access Token** and **Refresh Token**.
5.  Paste these tokens into the respective fields in the plugin settings.

### Imgur Configuration
To enable image uploads, an Imgur Client ID is required.

1.  Register an application with the Imgur API.
2.  Obtain the **Client ID**.
3.  Enter the Client ID into the **Imgur Client ID** field in the plugin settings.

## Usage

1.  Create a folder named `auto-upload` (or your configured watch folder name) in the root of your vault.
2.  Open the note where the media link should be inserted.
3.  Move or drag a media file into the `auto-upload` folder.
4.  The plugin will process the file, upload it to the appropriate provider, and insert the link into the active document.

## Development Status

This software is currently in active development. Features and configuration options are subject to change.
