const fs = require("fs");
const path = require("path");
const { signCertificate } = require("./lib/crypto");
const { saveCertificate, readAll } = require("./lib/store");
const { generateCertificatePdf } = require("./lib/pdfGenerator");
const QRCode = require("qrcode");

async function createSample(holderName, course, issueDate) {
  const id = "CERT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  const certData = { id, holderName, course, issueDate };
  const signature = signCertificate(certData);
  const record = { ...certData, signature, createdAt: new Date().toISOString() };
  
  saveCertificate(record);

  // Generate Sample PDF file
  const verifyUrl = `http://localhost:3000/verify?id=${id}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 250 });
  const pdfBytes = await generateCertificatePdf(record, qrCodeDataUrl);

  const outDir = path.join(process.cwd(), "sample_certificates");
  fs.mkdirSync(outDir, { recursive: true });

  const pdfPath = path.join(outDir, `${id}_${holderName.replace(/\s+/g, "_")}.pdf`);
  fs.writeFileSync(pdfPath, pdfBytes);

  const jsonPath = path.join(outDir, `${id}_metadata.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(record, null, 2));

  console.log(`Created sample for ${holderName}: ${pdfPath}`);
}

async function main() {
  console.log("Generating sample authentic certificates...");
  await createSample("Aanya Singh", "B.Tech Computer Science & Engineering", "2026-06-15");
  await createSample("Vikramaditya Sharma", "Master of Science in Cybersecurity", "2026-05-20");
  console.log("Done! Sample certificates created in ./sample_certificates");
}

main().catch(console.error);
