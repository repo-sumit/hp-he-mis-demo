#!/usr/bin/env node
/**
 * Minimal xlsx → JSON parser for HPU_167_Colleges_Data.xlsx.
 *
 * We skip a dependency on the `xlsx` npm package by:
 *   1. Unzipping the xlsx with `unzip` (Git Bash on Windows ships this).
 *   2. Reading `xl/sharedStrings.xml` + `xl/worksheets/sheet1.xml` as text.
 *   3. Walking each <row> and resolving `<c t="s"><v>N</v></c>` indices against
 *      the shared-strings table.
 *
 * Output: /tmp/hpu_colleges.json — one object per spreadsheet row, keyed by
 * the column headers in row 1.
 */
import { readFileSync, writeFileSync } from "node:fs";

const EXTRACT_DIR = ".tmp/xlsx_extract";
const sharedPath = `${EXTRACT_DIR}/xl/sharedStrings.xml`;
const sheetPath = `${EXTRACT_DIR}/xl/worksheets/sheet1.xml`;

const sharedXml = readFileSync(sharedPath, "utf8");
const sheetXml = readFileSync(sheetPath, "utf8");

// Pull every <si>...</si> → its concatenated <t> content.
const strings = [];
const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
let m;
while ((m = siRegex.exec(sharedXml))) {
  const inner = m[1];
  let parts = [];
  let t;
  tRegex.lastIndex = 0;
  while ((t = tRegex.exec(inner))) parts.push(decode(t[1]));
  strings.push(parts.join(""));
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// Column label (A, B, ... AA) → zero-based index.
function colIndex(ref) {
  // "B12" → 1
  const letters = ref.match(/[A-Z]+/)[0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

// Parse rows into sparse arrays of cell values.
const rowRegex = /<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
const attrRegex = /(\w+)="([^"]*)"/g;

const rows = [];
let rowMatch;
while ((rowMatch = rowRegex.exec(sheetXml))) {
  const cells = [];
  const inner = rowMatch[2];
  cellRegex.lastIndex = 0;
  let cellMatch;
  while ((cellMatch = cellRegex.exec(inner))) {
    const attrText = cellMatch[1];
    const body = cellMatch[2];
    const attrs = {};
    attrRegex.lastIndex = 0;
    let a;
    while ((a = attrRegex.exec(attrText))) attrs[a[1]] = a[2];
    const ref = attrs.r;
    const type = attrs.t; // undefined|n|s|str|inlineStr|b
    const idx = colIndex(ref);

    let value = "";
    if (type === "s") {
      const vMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      if (vMatch) value = strings[Number(vMatch[1])] ?? "";
    } else if (type === "inlineStr") {
      const tMatch = body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
      if (tMatch) value = decode(tMatch[1]);
    } else {
      const vMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      if (vMatch) value = vMatch[1];
    }
    cells[idx] = value;
  }
  rows.push(cells);
}

if (rows.length === 0) {
  console.error("No rows parsed");
  process.exit(1);
}

const headers = rows[0].map((h) => (h ?? "").trim());
console.error("Headers:", headers);
console.error("Row count (incl header):", rows.length);

const records = rows.slice(1).map((cells) => {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = cells[i] ?? "";
  });
  return obj;
});

writeFileSync(".tmp/hpu_colleges.json", JSON.stringify(records, null, 2));
console.error(`Wrote ${records.length} records to .tmp/hpu_colleges.json`);

// Quick stats to stdout
const byCollege = {};
for (const r of records) {
  const key = r.institution_name || r.normalized_name;
  if (!key) continue;
  if (!byCollege[key]) byCollege[key] = [];
  byCollege[key].push(r);
}
console.log("Distinct colleges:", Object.keys(byCollege).length);

const byDistrict = {};
for (const key of Object.keys(byCollege)) {
  const rows = byCollege[key];
  const d = (rows[0].district || "").trim();
  byDistrict[d] = (byDistrict[d] || 0) + 1;
}
console.log("\nColleges by district:");
for (const [d, c] of Object.entries(byDistrict).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${d.padEnd(24)} ${c}`);
}

const byType = {};
for (const key of Object.keys(byCollege)) {
  const rows = byCollege[key];
  const t = (rows[0].institution_type || "").trim();
  byType[t] = (byType[t] || 0) + 1;
}
console.log("\nColleges by institution_type:");
for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(32)} ${c}`);
}

const allCourses = new Set();
for (const r of records) {
  const c = (r.degree_name || r.course_name || "").trim();
  if (c) allCourses.add(c);
}
console.log(`\nDistinct course / degree labels: ${allCourses.size}`);
console.log(`First 30:`, Array.from(allCourses).slice(0, 30));
