import * as fs from "fs";
import * as Terser from "terser";
import { minify } from "html-minifier-terser";
import esbuild from "esbuild";

export async function Minify(log = false) {
    log && console.log("Start Building...");

    let html = fs.readFileSync("src/index.html", "utf8");

    const images = {};
    const pngFiles = fs
        .readdirSync("src/assets")
        .filter((f) => f.endsWith(".png"));

    for (const png of pngFiles) {
        const buffer = fs.readFileSync("src/assets/" + png);
        const base64 = buffer.toString("base64");
        images[png] = `data:image/png;base64,${base64}`;
        log &&
            console.log(
                `+++ image loaded: ${png} (${(buffer.length / 1024).toFixed(
                    1
                )}KB)`
            );
    }

    const js = await esbuild.build({
        entryPoints: ["src/main.js"],
        bundle: true,
        write: false,
        format: "iife",
    });
    let jsContent = js.outputFiles[0].text;

    for (const [filename, dataUri] of Object.entries(images)) {
        jsContent = jsContent.replace(
            new RegExp(`["']assets/${filename}["']`, "g"),
            `"${dataUri}"`
        );
    }
    log && console.log(`+++ script loaded: (${jsContent.length} bites)`);

    const res = await Terser.minify(jsContent, {
        compress: {
            drop_console: log,
            drop_debugger: log,
            passes: 2,
        },
        mangle: {
            toplevel: true,
            reserved: [
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
                "H7",
                "H8",
                "H9",
                "H10",
            ],
            properties: {
                regex: /.*/,
                reserved: ["space", "enter", "shift", "ctrl", "alt"],
            },
        },
        format: {
            comments: false,
            beautify: false,
        },
    });

    if (res.code) {
        jsContent = res.code;
    }
    html = html.replace("</body>", `<script>\n${jsContent}\n</script></body>`);

    log && console.log("Comperessing...");
    const minified = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
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
    log && console.log(`===== Build complete`);
    log &&
        console.log(
            `===== Original size: ${(originalSize / 1024).toFixed(1)}KB`
        );
    log &&
        console.log(`===== Compressed size: ${(newSize / 1024).toFixed(1)}KB`);
    log && console.log(`===== Compress Rate: ${ratio}%`);
    log && console.log(`===== Output: dist/index.html`);
    return { originalSize, newSize };
}
