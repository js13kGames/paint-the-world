import { Minify } from "./minify.js";
import liveServer from "live-server";
import * as fs from "fs";
import path from "path";

async function Build() {
    await Minify();
}

async function dev() {
    console.log(" Starting dev server...");
    await Build();
    const params = {
        port: 3000,
        host: "localhost",
        root: "dist",
        open: false,
        ignore: "node_modules",
        file: "index.html",
        wait: 200,
        logLevel: 2,
    };

    let isBuilding = false;
    let timeoutId = null;

    async function rebuild() {
        if (isBuilding) return;
        isBuilding = true;

        try {
            console.log("🔄 Rebuilding...");
            await Build();
            console.log("✅ Rebuild complete\n");
        } catch (error) {
            console.error("❌ Rebuild failed:", error.message);
        } finally {
            isBuilding = false;
        }
    }
    function debouncedRebuild() {
        rebuild();
    }
    fs.watch("src", { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        if (filename.startsWith(".")) return;

        const ext = path.extname(filename);
        const validExts = [
            ".js",
            ".html",
            ".css",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".json",
        ];
        if (!validExts.includes(ext)) return;

        console.log(`📄 ${filename} changed`);
        debouncedRebuild();
    });

    liveServer.start(params);
    return new Promise((resolve) => {});
}

dev().catch((err) => {
    console.error("❌ Dev server failed:", err.message);
    process.exit(1);
});
