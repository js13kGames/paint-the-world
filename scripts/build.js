import path from "path";
import AdmZip from "adm-zip";
import { Minify } from "./minify.js";
import * as fs from "fs"

export function zipFile(filePath, zipPath, zipEntryName) {
    const fileBuffer = fs.readFileSync(filePath);
    const zip = new AdmZip();
    const entryName = zipEntryName || path.basename(filePath);
    zip.addFile(entryName, fileBuffer);
    zip.writeZip(zipPath);
    const size = fs.statSync(zipPath).size;
    return size;
}


Minify(true)
    .catch((err) => {
        console.error("--- Build failed:", err.message);
        process.exit(1);
    })
    .then(() => {
        const filePath = "./dist/index.html";
        const zipPath = "./dist/game.zip";

        if (fs.existsSync(filePath)) {
            const size = zipFile(filePath, zipPath);
            console.log(`===== ZIP success: ${zipPath}`);
            console.log(`===== ZIP size: ${(size / 1024).toFixed(1)}KB`);
        } else {
            console.error(`--- File not found: ${filePath}`);
        }
    });
