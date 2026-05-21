import fs from 'fs';
import path from 'path';

const ROOTS = [
  path.join(process.cwd(), 'frontend', 'src'),
  path.join(process.cwd(), 'backend', 'src'),
];

const EXT = new Set(['.ts', '.scss']);

function stripComments(content) {
  let out = '';
  let i = 0;
  const n = content.length;

  while (i < n) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === "'" || ch === '"' || ch === '`') {
      const end = readString(content, i, ch);
      out += content.slice(i, end);
      i = end;
      continue;
    }

    if (ch === '/' && next === '/') {
      i += 2;
      while (i < n && content[i] !== '\n') i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(content[i] === '*' && content[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    out += ch;
    i++;
  }

  return out
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
}

function readString(src, start, quote) {
  let i = start + 1;
  const n = src.length;
  while (i < n) {
    if (src[i] === '\\') {
      i += 2;
      continue;
    }
    if (src[i] === quote) return i + 1;
    if (quote === '`' && src[i] === '$' && src[i + 1] === '{') {
      i += 2;
      let depth = 1;
      while (i < n && depth > 0) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') depth--;
        i++;
      }
      continue;
    }
    i++;
  }
  return n;
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walk(p, files);
    } else if (EXT.has(path.extname(name))) {
      files.push(p);
    }
  }
  return files;
}

let count = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const raw = fs.readFileSync(file, 'utf8');
    const stripped = stripComments(raw);
    if (stripped !== raw) {
      fs.writeFileSync(file, stripped.endsWith('\n') ? stripped : stripped + '\n');
      count++;
    }
  }
}
console.log(`Comentarios eliminados en ${count} archivos.`);
