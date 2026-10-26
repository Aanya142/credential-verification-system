"use client";
import { useState } from "react";
import Link from "next/link";
import { Award, Download, ArrowRight, Copy, Check, Sparkles, Key } from "lucide-react";

export default function IssuePage() {
  const [holderName, setHolderName] = useState("");
  const [course, setCourse] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function fillSample(name, degree) {
    setHolderName(name);
    setCourse(degree);
    setIssueDate(new Date().toISOString().split("T")[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holderName, course, issueDate }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to issue certificate.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not connect to the cryptographic issuance service.");
    } finally {
      setLoading(false);
    }
  }

  function copySignature() {
    if (!result?.certificate?.signature) return;
    navigator.clipboard.writeText(result.certificate.signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Award size={32} color="#818CF8" /> Certificate Issuance Engine
        </h1>
        <p className="sub">
          Generate tamper-proof academic credentials signed with the University&apos;s 2048-bit RSA Private Key.
        </p>
      </div>

      {/* Quick Test Presets */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>Quick Presets:</span>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "6px 14px", fontSize: 12 }}
          onClick={() => fillSample("Aanya Singh", "B.Tech Computer Science & Engineering")}
        >
          🎓 Aanya Singh (B.Tech CSE)
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "6px 14px", fontSize: 12 }}
          onClick={() => fillSample("Rohan Mehta", "Master of Business Administration (MBA)")}
        >
          🎓 Rohan Mehta (MBA)
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div>
              <label>Student Full Name</label>
              <input
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="e.g. Aanya Singh"
                required
              />
            </div>
            <div>
              <label>Degree / Academic Program</label>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                required
              />
            </div>
          </div>

          <label>Conferral Date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
            style={{ maxWidth: 280 }}
          />

          <div style={{ marginTop: 24 }}>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px" }}>
              {loading ? (
                <>Signing with RSA-2048 &amp; Generating QR...</>
              ) : (
                <><Key size={18} /> Sign &amp; Issue Academic Certificate</>
              )}
            </button>
          </div>
        </form>

        {error && <div className="result-banner result-invalid">{error}</div>}
      </div>

      {/* Success Output Panel */}
      {result && (
        <div className="card glow-border" style={{ border: "1px solid rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="badge green" style={{ marginBottom: 8 }}>Cryptographically Signed</span>
              <h2 style={{ color: "#F8FAFC", margin: "4px 0" }}>Certificate Successfully Registered</h2>
              <p style={{ color: "#94A3B8", fontSize: 13.5, margin: 0 }}>
                This record has been canonicalized and signed. Permanent proof of degree completion.
              </p>
            </div>

            <div className="btn-row" style={{ marginTop: 0 }}>
              <a
                href={`/api/pdf?id=${result.certificate.id}`}
                className="btn btn-secondary"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={16} /> Download Official PDF
              </a>
              <Link href={`/verify?id=${result.certificate.id}`} className="btn">
                Verify Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div style={{ margin: "24px 0" }}>
            <div className="field-row">
              <span className="field-label">Certificate ID</span>
              <span className="field-val badge blue">{result.certificate.id}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Student Recipient</span>
              <span className="field-val">{result.certificate.holderName}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Degree Conferred</span>
              <span className="field-val">{result.certificate.course}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Conferral Date</span>
              <span className="field-val">{result.certificate.issueDate}</span>
            </div>
          </div>

          <div className="grid-2">
            <div style={{ textAlign: "center", background: "rgba(15, 23, 42, 0.7)", padding: 20, border: "1px solid var(--border)", borderRadius: 12 }}>
              <img src={result.qrCodeDataUrl} alt="QR Code" width={160} height={160} style={{ borderRadius: 8, border: "6px solid white" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginTop: 12 }}>
                Embedded Verifier QR
              </div>
              <p className="hint">Scannable by any mobile device to view verification node</p>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ margin: 0 }}>RSA Digital Signature (Base64)</label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={copySignature}
                  style={{ padding: "4px 10px", fontSize: 11, marginTop: 0 }}
                >
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <div className="mono" style={{ maxHeight: 150, overflowY: "auto", marginTop: 8 }}>
                {result.certificate.signature}
              </div>
              <p className="hint">
                Deterministic hash signed with private key. Only the issuing university could generate this signature.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
