const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const Terser = require("terser");
const { minify } = require("html-minifier-terser");

function zipFile(filePath, zipPath, zipEntryName) {
    const fileBuffer = fs.readFileSync(filePath);
    const zip = new AdmZip();
    const entryName = zipEntryName || path.basename(filePath);
    zip.addFile(entryName, fileBuffer);
    zip.writeZip(zipPath);
    const size = fs.statSync(zipPath).size;
    return size;
}

async function build() {
    console.log("Start Building...");

    let html = fs.readFileSync("src/index.html", "utf8");

    const images = {};
    const pngFiles = fs
        .readdirSync("src/assets")
        .filter((f) => f.endsWith(".png"));

    for (const png of pngFiles) {
        const buffer = fs.readFileSync("src/assets/" + png);
        const base64 = buffer.toString("base64");
        images[png] = `data:image/png;base64,${base64}`;
        console.log(
            `+++ image loaded: ${png} (${(buffer.length / 1024).toFixed(1)}KB)`
        );
    }

    const scriptRegex = /<script\s+src="([^"]+\.js)"(?:\s+[^>]*)?><\/script>/gi;
    let scriptMatches = [];
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        scriptMatches.push(match);
    }

    let totalJS = [];
    let scriptTag = null;
    for (const m of scriptMatches) {
        const jsFile = "src/" + m[1];
        const jsPath = path.join(process.cwd(), jsFile);
        if (fs.existsSync(jsPath)) {
            let jsContent = fs.readFileSync(jsPath, "utf8");

            for (const [filename, dataUri] of Object.entries(images)) {
                jsContent = jsContent.replace(
                    new RegExp(`["']assets/${filename}["']`, "g"),
                    `"${dataUri}"`
                );
            }

            console.log(
                `+++ script loaded: ${jsFile} (${jsContent.length} bites)`
            );
            totalJS.push(jsContent);
            if (scriptTag === null) {
                scriptTag = m[0];
            } else {
                html = html.replace(m[0], ``);
            }
        } else {
            console.warn(`--- script not found: ${jsFile}`);
        }
    }
    let js = totalJS.join("\n");

    const res = await Terser.minify(js, {
        compress: {
            drop_console: true,
            drop_debugger: true,
            passes: 2,
        },
        mangle: {
            toplevel: true,
            // properties: {
            //     regex: /.*/, 
            // },
        },
        format: {
            comments: false,
            beautify: false,
        },
    });

    if (res.code) {
        js = res.code;
    }
    html = html.replace(scriptTag, `<script>\n${js}\n</script>`);

    console.log("Comperessing...");
    const minified = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 2,
            },
        },
        minifyCSS: {
            level: 2,
        },
        html5: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
    });

    if (!fs.existsSync("dist")) {
        fs.mkdirSync("dist");
    }
    fs.writeFileSync("dist/index.html", minified);

    const originalSize = html.length;
    const newSize = minified.length;
    const ratio = ((1 - newSize / originalSize) * 100).toFixed(1);
    console.log(`===== Build complete`);
    console.log(`===== Original size: ${(originalSize / 1024).toFixed(1)}KB`);
    console.log(`===== Compressed size: ${(newSize / 1024).toFixed(1)}KB`);
    console.log(`===== Compress Rate: ${ratio}%`);
    console.log(`===== Output: dist/index.html`);
}

build()
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
