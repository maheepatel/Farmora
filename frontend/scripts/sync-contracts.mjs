import { cpSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const src = resolve(root, "contracts/deployed.json");
const dest = resolve(root, "frontend/src/lib/deployed.json");

mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { force: true });
console.log(`synced ${src} -> ${dest}`);
