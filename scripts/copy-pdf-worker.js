// scripts/copy-pdf-worker.js
// pdfjs-dist ships its worker as a build artifact inside node_modules;
// the browser needs it served from our own origin (public/), so it has
// to be copied out after every install to stay in sync with the
// installed pdfjs-dist version.
const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "..",
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (!fs.existsSync(src)) {
  console.warn("⚠️ pdfjs-dist worker not found at", src, "— skipping copy.");
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log("✅ Copied pdf.worker.min.mjs to public/");
