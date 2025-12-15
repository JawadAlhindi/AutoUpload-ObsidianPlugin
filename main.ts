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

        // Auto-upload ONLY for files created inside the watch folder
        this.registerEvent(
            this.app.vault.on("create", async (file: TFile) => {
                const watchFolder = this.settings.watchFolder.endsWith("/")
                    ? this.settings.watchFolder
                    : this.settings.watchFolder + "/";
                const filePath = file.path;

                console.log("File created:", filePath);
                console.log("Watch folder:", watchFolder);

                if (!filePath.startsWith(watchFolder)) {
                    console.log("File not in watch folder. Skipping:", filePath);
                    return;
                }

                console.log("File is in watch folder! Processing:", filePath);
                new Notice("Detected file in auto-upload folder: " + file.name);

                const ext = file.extension.toLowerCase();
                console.log("File extension:", ext);

                try {
                    if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) {
                        new Notice("Uploading image: " + file.name);
                        const url = await uploadImage(this, file);
                        this.insertLink(file, url);
                    } else if (["mp4", "mov", "m4v"].includes(ext)) {
                        new Notice("Uploading video to YouTube: " + file.name);
                        const url = await uploadVideo(this, file);
                        this.insertLink(file, url);
                    }
                } catch (err) {
                    console.error("Upload error:", err);
                    new Notice("Upload failed: " + err);
                }
            })
        );

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
            if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) {
                const url = await uploadImage(this, file);
                if (url) {
                    this.settings.uploadCache[cacheKey] = url;
                    await this.saveSettings();
                }
                return url;
            } else if (["mp4", "mov", "m4v"].includes(ext)) {
                const url = await uploadVideo(this, file);
                if (url) {
                    this.settings.uploadCache[cacheKey] = url;
                    await this.saveSettings();
                }
                return url;
            } else {
                return null;
            }
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
