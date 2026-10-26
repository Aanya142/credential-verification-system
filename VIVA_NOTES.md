# Viva Prep — Decentralized Academic Credential Verification System

## 1. How to run this RIGHT NOW

```
cd credential-verification-demo
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

First `npm install` will take 20-30 seconds. Do this BEFORE the viva starts,
not while someone is watching — nothing looks worse than staring at an
install progress bar during a demo.

## 2. What's actually real here vs. simplified for time

Be upfront about this if asked — it's a sign of maturity, not weakness:

**Actually real and fully working:**
- RSA-2048 key generation, signing, and verification — using Node's
  built-in `crypto` module, exactly as described in the SRS. No mock,
  no hardcoded "valid: true".
- The tamper-detection logic is genuine: change one character of the
  certificate data and the signature check mathematically fails. I
  tested this myself before handing it over — issued a cert, verified
  it valid, tampered the holder name, verified it correctly failed,
  restored it, verified it passed again.
- QR code generation (using the `qrcode` package) linking to a real
  verification URL.

**Simplified for a same-day demo (say this plainly if asked):**
- Certificates are stored in a local JSON file instead of MySQL. The
  verification LOGIC is identical to what a production version would
  do — only the storage layer is simplified so you don't need to set
  up a database to run this today.
- No login/auth screen on the Issuer Portal yet — anyone hitting
  /issue can issue a certificate. In the real system this would be
  behind admin authentication (this is already designed in your SRS
  and Use Case diagram — just not wired up in this quick prototype).
- The "university" is a single hardcoded demo issuer, not a
  multi-tenant system yet.
- No PDF export yet — the signed certificate data and QR code display
  on-screen, which is enough to prove the mechanism works.

## 3. Suggested live demo script (2-3 minutes)

1. Open the home page — briefly explain the idea in one sentence:
   "Universities sign certificates digitally so anyone can verify them
   instantly instead of waiting days for a manual check."
2. Go to **Issuer Portal**, fill in a name/course/date, hit Generate &
   Sign. Point out: "This just happened — the server signed this data
   with the university's private key using RSA-SHA256."
3. Click "Verify this certificate now" — show it comes back **VALID**.
4. Scroll to the tamper-demo section on the same verify page. Change
   the holder's name to something else, click Re-Verify — show it
   comes back **INVALID / TAMPERED**. This is the moment to say:
   "This is the actual point of the project — you can't alter a
   certificate after issuance without the signature check catching it."
5. Change the name back, Re-Verify again, show it goes back to VALID —
   proves it's not just always failing, it's genuinely checking.

## 4. Likely questions and how to answer them

**"Why not use blockchain?"**
Blockchain solves a problem this system doesn't have — distributed
trust with no central authority. Here, the university IS the trusted
authority (they issue the degree in the first place), so a signed
record verified against their public key achieves the same tamper-
evidence without the complexity, cost, or environmental overhead of a
blockchain. This is a deliberate, defensible design decision, not a
missing feature.

**"What if the private key gets leaked?"**
That's exactly why a real deployment would use a Hardware Security
Module (HSM) instead of storing the key in a file — I've noted this in
the proposal's Future Scope. For a lab-scale prototype, the key is
just a local file, which is fine for demonstrating the mechanism but
is explicitly called out as not production-ready.

**"How is this different from just hashing the certificate?"**
A plain hash only lets you check "has this changed" if you already
trust where the hash came from. A digital signature additionally
proves WHO created it — because only someone holding the private key
could have produced a signature that validates against the matching
public key. That's the difference between integrity-checking and
actual authentication.

**"Why RSA and not something else?"**
RSA is well-understood, has built-in support in Node's crypto module
with no extra dependencies, and is fast enough at this scale (2048-bit
signing/verification happens in milliseconds). ECC would produce
smaller signatures and could be a future optimization, mentioned in
the original project comparison.

**"Is this actually secure enough for real use?"**
Not yet, and that's an honest answer, not a failure — the crypto
mechanism itself is sound (RSA-SHA256 is a real, standard scheme), but
a production system needs HSM-backed key storage, real admin
authentication, a proper database, and audited code before any real
university would trust it. This prototype exists to prove the core
mechanism works, which it does.

**"What does the Use Case / Class diagram map to in this code?"**
- "Generate Certificate" + "Sign Certificate" (include) → `/api/issue`
- "Verify Certificate" + "Check Digital Signature" (include) → `/api/verify` (GET)
- "Detect Tampering" (extend) → the same `/api/verify` (POST) route,
  triggered when the re-verify fails
- "View My Certificates" / "Login" — designed in the diagrams, not
  built in this quick prototype (be honest about this if asked)

## 5. If something breaks live

- If `npm run dev` fails to start: run `rm -rf .next` then `npm run dev` again.
- If a page shows an error: check the terminal running `npm run dev` —
  the actual error will be printed there, screenshot it and you can
  debug it together afterward.
- The certificate data lives in `data/certificates.json` once you
  issue one — you can open that file to literally show the mentor the
  stored signature if they want to see it as raw data.
