import crypto from "node:crypto";
import fs from "node:fs/promises";

export default async () => ({
  css: `sha384-${crypto
    .createHash("sha384")
    .update(await fs.readFile("static/style.css"))
    .digest("base64")}`,
  js: `sha384-${crypto
    .createHash("sha384")
    .update(await fs.readFile("static/index.js"))
    .digest("base64")}`,
});
