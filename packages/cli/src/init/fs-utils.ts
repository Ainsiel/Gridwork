import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

export function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

export function resolveInside(root: string, relativePath: string): string {
  const resolved = resolve(root, relativePath);
  const rootWithSeparator = root.endsWith(sep) ? root : `${root}${sep}`;

  if (resolved !== root && !resolved.startsWith(rootWithSeparator)) {
    throw new Error(`Path escapes root: ${relativePath}`);
  }

  return resolved;
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureParentDirectory(path: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
}

export async function writeTextFile(path: string, content: string): Promise<void> {
  await ensureParentDirectory(path);
  await writeFile(path, content, "utf8");
}

export async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await writeTextFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function sha256File(path: string): Promise<string> {
  const content = await readFile(path);
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

export async function readJsonFile<T>(path: string): Promise<T> {
  const content = await readFile(path, "utf8");
  return JSON.parse(content) as T;
}

export async function listFiles(root: string): Promise<string[]> {
  const files: string[] = [];

  async function visit(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = resolve(current, entry.name);
      const relativePath = toPosixPath(relative(root, absolutePath));

      if (entry.isSymbolicLink()) {
        throw new Error(`Symlinks are not allowed in factory source: ${relativePath}`);
      }

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      files.push(relativePath);
    }
  }

  await visit(root);
  return files.sort((a, b) => a.localeCompare(b));
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}
