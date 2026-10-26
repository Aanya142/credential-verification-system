"use client";
import { useState } from "react";
import Link from "next/link";
import { Download, CheckCircle, ArrowRight, Copy, Check } from "lucide-react";

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
      setError("Could not connect to the issuance service.");
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
      <div style={{ marginBottom: 24 }}>
        <h1>Certificate Issuance Portal</h1>
        <p className="sub">
          Generate an academic credential and sign it using the university&apos;s RSA-2048 private key.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#64748B" }}>Sample Data:</span>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "4px 10px", fontSize: 12 }}
          onClick={() => fillSample("Aanya Singh", "B.Tech Computer Science & Engineering")}
        >
          Aanya Singh (B.Tech CSE)
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "4px 10px", fontSize: 12 }}
          onClick={() => fillSample("Rohan Mehta", "Master of Business Administration")}
        >
          Rohan Mehta (MBA)
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
              <label>Degree / Program</label>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                required
              />
            </div>
          </div>

          <label>Date of Conferral</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
            style={{ maxWidth: 260 }}
          />

          <div style={{ marginTop: 20 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Generating Signature..." : "Sign & Issue Certificate"}
            </button>
          </div>
        </form>

        {error && <div className="result-banner result-invalid">{error}</div>}
      </div>

      {result && (
        <div className="card" style={{ borderLeft: "4px solid #16A34A" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ color: "#166534", margin: "0 0 4px 0" }}>Certificate Issued Successfully</h2>
              <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
                Signed with RSA-SHA256 and registered in database.
              </p>
            </div>

            <div className="btn-row" style={{ marginTop: 0 }}>
              <a
                href={`/api/pdf?id=${result.certificate.id}`}
                className="btn btn-secondary"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={15} /> Download PDF
              </a>
              <Link href={`/verify?id=${result.certificate.id}`} className="btn">
                Verify Credential <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div style={{ margin: "20px 0" }}>
            <div className="field-row">
              <span className="field-label">Certificate ID</span>
              <span className="field-val badge blue">{result.certificate.id}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Student Name</span>
              <span className="field-val">{result.certificate.holderName}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Degree</span>
              <span className="field-val">{result.certificate.course}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Conferral Date</span>
              <span className="field-val">{result.certificate.issueDate}</span>
            </div>
          </div>

          <div className="grid-2">
            <div style={{ textAlign: "center", background: "#F8FAFC", padding: 16, border: "1px solid #E2E8F0", borderRadius: 6 }}>
              <img src={result.qrCodeDataUrl} alt="QR Code" width={160} height={160} style={{ borderRadius: 4 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginTop: 8 }}>
                Verification QR Code
              </div>
              <p className="hint">Direct link to verification endpoint</p>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ margin: 0 }}>RSA Digital Signature</label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={copySignature}
                  style={{ padding: "3px 8px", fontSize: 11, marginTop: 0 }}
                >
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <div className="mono" style={{ maxHeight: 150, overflowY: "auto", marginTop: 6 }}>
                {result.certificate.signature}
              </div>
              <p className="hint">
                Base64-encoded signature generated by signing the canonical SHA-256 hash.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
