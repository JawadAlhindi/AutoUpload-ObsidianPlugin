import { TFile } from "obsidian";

export interface ImageUploader {
    upload(file: TFile): Promise<string>;
}

