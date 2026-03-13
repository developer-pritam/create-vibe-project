import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import Mustache from 'mustache';

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf8');
}

export async function renderTemplate(templatePath: string, vars: object): Promise<string> {
  const raw = await readFile(templatePath, 'utf8');
  return Mustache.render(raw, vars);
}

export async function processTemplate(src: string, dest: string, vars: object): Promise<void> {
  await ensureDir(dirname(dest));
  if (src.endsWith('.mustache')) {
    const rendered = await renderTemplate(src, vars);
    await writeFile(dest.replace(/\.mustache$/, ''), rendered, 'utf8');
  } else {
    await copyFile(src, dest);
  }
}

export async function copyTemplateDir(
  srcDir: string,
  destDir: string,
  vars: object
): Promise<void> {
  if (!existsSync(srcDir)) return;
  const { readdirSync, statSync } = await import('fs');
  const entries = readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const destName = entry.endsWith('.mustache') ? entry.replace(/\.mustache$/, '') : entry;
    const destPath = join(destDir, destName);
    if (statSync(srcPath).isDirectory()) {
      await copyTemplateDir(srcPath, destPath, vars);
    } else {
      await processTemplate(srcPath, destPath, vars);
    }
  }
}

export function writeJson(filePath: string, obj: object): Promise<void> {
  return writeFileSafe(filePath, JSON.stringify(obj, null, 2) + '\n');
}
