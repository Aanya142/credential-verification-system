// This file is the actual cryptographic core of the project.
//
// It uses Node's BUILT-IN `crypto` module only - no external crypto
// library, no paid API. This matches what's described in the SRS.
//
// How it works (this is the part to explain in the viva):
// 1. The "university" has an RSA keypair. The PRIVATE key signs
//    certificates at issuance time. The PUBLIC key is what anyone
//    uses to verify a certificate later - it can be shared freely,
//    it cannot be used to forge a signature.
// 2. To sign a certificate, we take its data (holder name, course,
//    issue date, certificate id), turn it into a fixed, canonical
//    JSON string, and run RSA-SHA256 signing on it using the
//    private key. The signature is a block of bytes that only this
//    private key could have produced for this exact data.
// 3. To verify, we take the certificate data again, rebuild the same
//    canonical string, and check the signature against the PUBLIC
//    key. If even one character of the certificate data changes
//    after issuance, the signature check fails - that's what makes
//    tampering detectable.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const KEYS_FILE = path.join(process.cwd(), "data", "university-keys.json");

// Generates (once) or loads the "university" keypair used for the demo.
// In a real deployment, this private key would live somewhere far more
// protected than a JSON file - see the "Future Scope" note about
// Hardware Security Modules in the proposal.
function getUniversityKeys() {
  if (fs.existsSync(KEYS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
    return raw;
  }
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const keys = { publicKey, privateKey, universityName: "Manipal University Jaipur (Demo Issuer)" };
  fs.mkdirSync(path.dirname(KEYS_FILE), { recursive: true });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
  return keys;
}

// Builds the exact, deterministic string that gets signed/verified.
// Order of fields matters here - it has to be identical every time.
function canonicalize(certData) {
  return JSON.stringify({
    id: certData.id,
    holderName: certData.holderName,
    course: certData.course,
    issueDate: certData.issueDate,
  });
}

function signCertificate(certData) {
  const { privateKey } = getUniversityKeys();
  const data = canonicalize(certData);
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKey, "base64");
  return signature;
}

function verifyCertificate(certData, signature) {
  const { publicKey } = getUniversityKeys();
  const data = canonicalize(certData);
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(data);
  verifier.end();
  try {
    return verifier.verify(publicKey, signature, "base64");
  } catch {
    return false; // malformed signature - never crash, just fail closed
  }
}

module.exports = { getUniversityKeys, signCertificate, verifyCertificate, canonicalize };
