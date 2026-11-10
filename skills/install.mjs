#!/usr/bin/env node
import { mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skills = ["boardry-ask", "boardry-note"];
const home = process.env.HOME ?? "";
const cwd = process.cwd();

const args = process.argv.slice(2);
const global = args.includes("--global");
const targetIdx = args.indexOf("--target");

function defaultTargets() {
  if (global) {
    return [
      ["Claude Code", path.join(home, ".claude", "skills")],
      ["Cursor", path.join(home, ".cursor", "skills")],
      ["generic", path.join(home, ".agents", "skills")],
    ];
  }
  return [
    ["Claude Code", path.join(cwd, ".claude", "skills")],
    ["Cursor", path.join(cwd, ".cursor", "skills")],
    ["generic", path.join(cwd, ".agents", "skills")],
  ];
}

const targets =
  targetIdx >= 0 && args[targetIdx + 1]
    ? [["custom", path.resolve(args[targetIdx + 1])]]
    : defaultTargets();

for (const [label, dir] of targets) {
  let wrote = 0;
  for (const name of skills) {
    const src = path.join(here, name, "SKILL.md");
    if (!existsSync(src)) {
      console.error(`missing ${src}`);
      process.exit(1);
    }
    const dstDir = path.join(dir, name);
    const dst = path.join(dstDir, "SKILL.md");
    if (path.resolve(src) === path.resolve(dst)) continue; // running inside the source repo
    await mkdir(dstDir, { recursive: true });
    await copyFile(src, dst);
    wrote += 1;
  }
  console.log(`installed ${wrote}/${skills.length} boardry skills -> ${dir}  (${label})`);
}

console.log("\nDone. Start a new agent session to load the skills.");
