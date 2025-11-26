import { requestUrl, TFile } from "obsidian";
import AutoUploaderPlugin from "../main";

export async function uploadImage(plugin: AutoUploaderPlugin, file: TFile) {
    const data = await plugin.app.vault.readBinary(file);



    const res = await requestUrl({
        url: "https://api.imgur.com/3/image",
        method: "POST",
        headers: {
            Authorization: `Client-ID ${plugin.settings.imgurClientId}`
        },
        body: data
    });



    return res.json.data.link;
}