import {
    Plugin,
    TFile,
    Notice,
    Editor,
    MarkdownView
} from "obsidian";
import {
    AutoUploaderSettings,
    DEFAULT_SETTINGS,
    AutoUploaderSettingTab
} from "./src/settings";
import { uploadImage } from "./src/uploadImage";
import { uploadVideo } from "./src/uploadVideo";

export default class AutoUploaderPlugin extends Plugin {
    settings: AutoUploaderSettings;

    async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.addSettingTab(new AutoUploaderSettingTab(this.app, this));

        // Ribbon button for manual upload from watch folder
        this.addRibbonIcon("upload-cloud", "Upload media from watch folder", async () => {
            await this.uploadFromWatchFolder();
        });

        // Command to upload all images/videos in the current note
        this.addCommand({
            id: "upload-media-in-current-note",
            name: "Upload media in current note",
            editorCallback: async (editor) => {
                await this.uploadMediaInCurrentNote(editor);
            }
        });

        // Button in the editor's three-dots menu (right-click in editor)
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor, view) => {
                menu.addItem((item) => {
                    item
                        .setTitle("Upload media in this note")
                        .setIcon("cloud-upload")
                        .onClick(async () => {
                            await this.uploadMediaInCurrentNote(editor);
                        });
                });
            })
        );
    }

    insertLink(file: TFile, url: string) {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) return;
        editor.replaceSelection(url);
        new Notice("Uploaded: " + file.name);
    }

    // Manual upload from watch folder (triggered by ribbon button)
    private async uploadFromWatchFolder() {
        const watchFolder = this.settings.watchFolder.endsWith("/")
            ? this.settings.watchFolder.slice(0, -1)
            : this.settings.watchFolder;

        if (!watchFolder) {
            new Notice("No watch folder configured. Set it in plugin settings.");
            return;
        }

        const folder = this.app.vault.getAbstractFileByPath(watchFolder);
        if (!folder) {
            new Notice("Watch folder does not exist: " + watchFolder);
            return;
        }

        const allFiles = this.app.vault.getFiles();
        const mediaFiles = allFiles.filter(file => {
            if (!file.path.startsWith(watchFolder + "/")) return false;
            const ext = file.extension.toLowerCase();
            return ["png", "jpg", "jpeg", "gif", "webp", "heic", "mp4", "mov", "m4v"].includes(ext);
        });

        if (mediaFiles.length === 0) {
            new Notice("No media files found in watch folder.");
            return;
        }

        let uploaded = 0;
        let skipped = 0;

        let cacheUpdated = false;

        for (const file of mediaFiles) {
            const cacheKey = file.name.toLowerCase();

            // Skip if already uploaded
            if (this.settings.uploadCache && this.settings.uploadCache[cacheKey]) {
                skipped++;
                continue;
            }

            const ext = file.extension.toLowerCase();
            try {
                if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) {
                    new Notice("Uploading image: " + file.name);
                    const url = await uploadImage(this, file);
                    if (url) {
                        this.settings.uploadCache[cacheKey] = url;
                        cacheUpdated = true;
                        uploaded++;
                    }
                } else if (["mp4", "mov", "m4v"].includes(ext)) {
                    new Notice("Uploading video: " + file.name);
                    const url = await uploadVideo(this, file);
                    if (url) {
                        this.settings.uploadCache[cacheKey] = url;
                        cacheUpdated = true;
                        uploaded++;
                    }
                }
            } catch (err) {
                console.error("Upload error for " + file.name + ":", err);
                new Notice("Upload failed: " + file.name);
            }
        }

        // Persist cache once after all uploads instead of after each file.
        if (cacheUpdated) {
            await this.saveSettings();
        }

        new Notice(`Upload complete: ${uploaded} uploaded, ${skipped} already cached.`);
    }

    private async uploadMediaInCurrentNote(editor: Editor) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view || !view.file) {
            new Notice("No active markdown note.");
            return;
        }

        const noteFile = view.file;
        let content = editor.getValue();
        let changed = false;
        const processed = new Set<string>();

        // 1) Wiki-style embeds: ![[Pasted image 20251215111931.png]] or ![[800x800 3.jpg]]
        const wikiRegex = /!\[\[([^\]]+)\]\]/g;
        const wikiMatches: RegExpExecArray[] = [];
        let wMatch: RegExpExecArray | null;
        while ((wMatch = wikiRegex.exec(content)) !== null) {
            wikiMatches.push(wMatch);
        }

        for (const match of wikiMatches) {
            const fullMatch = match[0];
            const rawTarget = match[1];
            const target = rawTarget.split("|")[0].split("#")[0].trim();

            const linked = this.resolveLinkedFile(target, noteFile);
            if (!linked) continue;

            if (processed.has(linked.path)) continue;

            const url = await this.uploadFileByType(linked);
            if (!url) continue;

            const replacement = `![](${url})`;
            content = content.replace(fullMatch, replacement);
            await this.moveToWatchFolder(linked);
            processed.add(linked.path);
            changed = true;
        }

        // 2) Markdown-style images: ![alt](Pasted image 20251215111931.png) or ![alt](800x800 3.jpg)
        const mdImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
        const mdMatches: RegExpExecArray[] = [];
        let mMatch: RegExpExecArray | null;
        while ((mMatch = mdImageRegex.exec(content)) !== null) {
            mdMatches.push(mMatch);
        }

        for (const match of mdMatches) {
            const fullMatch = match[0];
            const rawPath = match[1].trim();
            const target = rawPath.split("#")[0].trim();

            const linked = this.resolveLinkedFile(target, noteFile);
            if (!linked) continue;

            if (processed.has(linked.path)) continue;

            const url = await this.uploadFileByType(linked);
            if (!url) continue;

            const replacement = `![](${url})`;
            content = content.replace(fullMatch, replacement);
            await this.moveToWatchFolder(linked);
            processed.add(linked.path);
            changed = true;
        }

        // 3) Fallback: any image file whose name appears in the note content
        const allFiles = this.app.vault.getFiles();
        for (const file of allFiles) {
            const ext = file.extension.toLowerCase();
            if (!["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) continue;
            if (processed.has(file.path)) continue;

            if (!content.includes(file.name)) continue;

            const url = await this.uploadFileByType(file);
            if (!url) continue;

            const escapedName = file.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            const wikiPattern = new RegExp(`!\\[\\[${escapedName}(?:\\|[^\\]]*)?\\]\\]`, "g");
            const mdPattern = new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escapedName}[^)]*\\)`, "g");
            const replacement = `![](${url})`;

            content = content.replace(wikiPattern, replacement);
            content = content.replace(mdPattern, replacement);

            await this.moveToWatchFolder(file);
            processed.add(file.path);
            changed = true;
        }

        if (changed) {
            // Persist cache once after all uploads for this note.
            await this.saveSettings();
            editor.setValue(content);
            new Notice("Uploaded media and updated note links.");
        } else {
            new Notice("No uploadable images/videos found in this note.");
        }
    }

    // Resolve "Pasted image 20251215111931.png" or "800x800 3.jpg" to a vault file
    private resolveLinkedFile(target: string, noteFile: TFile): TFile | null {
        // Try normal Obsidian resolution
        const linked = this.app.metadataCache.getFirstLinkpathDest(target, noteFile.path);
        if (linked) {
            return linked;
        }

        // Fallback: search by name/path across the vault
        const targetLower = target.toLowerCase();
        const files = this.app.vault.getFiles();
        for (const file of files) {
            const nameLower = file.name.toLowerCase();
            const pathLower = file.path.toLowerCase();
            if (nameLower === targetLower || pathLower.endsWith("/" + targetLower)) {
                return file;
            }
        }

        return null;
    }

    private async uploadFileByType(file: TFile): Promise<string | null> {
        const ext = file.extension.toLowerCase();

        // Use filename-based cache so the same media name
        // (e.g., "Pasted image ....png" or "800x800 3.jpg")
        // is only uploaded once, even if moved to another folder
        const cacheKey = file.name.toLowerCase();

        // Check cache first to avoid double uploads or double API calls
        if (this.settings.uploadCache && this.settings.uploadCache[cacheKey]) {
            return this.settings.uploadCache[cacheKey];
        }

        try {
            let url: string | null = null;
            if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) {
                url = await uploadImage(this, file);
            } else if (["mp4", "mov", "m4v"].includes(ext)) {
                url = await uploadVideo(this, file);
            } else {
                return null;
            }

            if (url) {
                this.settings.uploadCache[cacheKey] = url;
                // Caller is responsible for calling saveSettings() after the batch.
            }
            return url;
        } catch (error) {
            console.error("Upload failed for file:", file.path, error);
            new Notice("Upload failed for " + file.name);
            return null;
        }
    }

    private async moveToWatchFolder(file: TFile) {
        let folder = this.settings.watchFolder || "";
        folder = folder.endsWith("/") ? folder.slice(0, -1) : folder;

        if (!folder) return;

        const newPath = `${folder}/${file.name}`;
        if (file.path === newPath) return;

        try {
            // @ts-ignore
            await this.app.fileManager.renameFile(file, newPath);
        } catch (error) {
            console.error("Failed to move file to watch folder:", error);
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
