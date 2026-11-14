#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const L = require("../logic.js");

const file = path.join(__dirname, "..", "data.json");
let raw;

try {
  raw = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error("data.json okunamadı:", error.message);
  process.exit(1);
}

const result = L.validateData(raw);

if (!result.ok) {
  console.error("data.json içinde " + result.errors.length + " sorun bulundu:");
  result.errors.forEach(function (err) {
    console.error("  - [" + err.index + "] " + err.field + ": " + err.message);
  });
  process.exit(1);
}

if (!result.data.announcements.length) {
  console.error("data.json içinde ilan yok.");
  process.exit(1);
}

const ids = new Set();
result.data.announcements.forEach(function (item) {
  if (ids.has(item.id)) {
    console.error("Tekrarlı ID:", item.id);
    process.exit(1);
  }
  ids.add(item.id);
});

console.log(
  "data.json geçerli: " + result.data.announcements.length + " ilan" +
  (result.data.isSample ? " (örnek veri)" : "") +
  ", güncelleme " + (result.data.updatedAt || "-")
);
