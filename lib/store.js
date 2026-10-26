// This stands in for the MySQL "Verification Registry" described in
// the SRS/proposal. For a same-day local demo, a JSON file avoids
// requiring a database install - the actual verification LOGIC
// (signing, verification, tamper detection) is real and identical to
// what a production version would do; only the storage layer is
// simplified. Worth saying exactly this if asked in the viva.

const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(process.cwd(), "data", "certificates.json");

function readAll() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeAll(records) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2));
}

function saveCertificate(record) {
  const all = readAll();
  all.push(record);
  writeAll(all);
}

function findCertificateById(id) {
  return readAll().find((r) => r.id === id) || null;
}

module.exports = { readAll, saveCertificate, findCertificateById };
