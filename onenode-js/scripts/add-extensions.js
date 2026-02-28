// scripts/add-extensions.js

import { readFile, writeFile, readdir, stat } from "fs/promises";
import { resolve, join } from "path";

const jsFileRegex = /\.js$/;
const importRegex = /from\s+['"](.+?)['"]/g;

async function addFileExtensionsToImports(directory) {
  async function processFile(filePath) {
    const content = await readFile(filePath, "utf8");
    const updatedContent = content.replace(importRegex, (match, importPath) => {
      // Skip external or already-suffixed imports
      if (importPath.startsWith(".") && !jsFileRegex.test(importPath)) {
        return match.replace(importPath, `${importPath}.js`);
      }
      return match;
    });
    await writeFile(filePath, updatedContent, "utf8");
    console.log(`Processed: ${filePath}`);
  }

  async function processDirectory(dir) {
    const items = await readdir(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        await processDirectory(fullPath);
      } else if (fullPath.endsWith(".js")) {
        await processFile(fullPath);
      }
    }
  }

  await processDirectory(directory);
}

const esmDirectory = resolve("./dist/esm");
await addFileExtensionsToImports(esmDirectory);