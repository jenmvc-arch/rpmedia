import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("../dist/", import.meta.url);
const publicFiles = ["index.html", "style.css", "editorial.css", "app.js", "assets"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of publicFiles) {
  await cp(new URL(file, root), new URL(file, output), { recursive: true });
}

console.log(`Prepared ${publicFiles.length} website entries in dist/.`);
