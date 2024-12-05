import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const filePath = join(__dirname, "../dist/_worker.js/chunks/_/davClient.mjs");

try {
  const content = await readFile(filePath, "utf8");
  const updated = content.replace(/n\.fetch/g, "fetch");
  await writeFile(filePath, updated);
  console.log("Successfully replaced n.fetch with fetch in davClient.mjs");
} catch (err) {
  console.error("Error processing file:", err);
  process.exit(1);
}
