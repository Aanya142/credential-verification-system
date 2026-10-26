"use client";
import { useState, useEffect } from "react";
import { Search, Upload, CheckCircle2, XCircle, RefreshCw, Download, RotateCcw } from "lucide-react";

export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState("id");
  const [certId, setCertId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Tamper state
  const [editable, setEditable] = useState(null);
  const [tamperResult, setTamperResult] = useState(null);
  const [tamperLoading, setTamperLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("id");
    if (idFromUrl) {
      setCertId(idFromUrl);
      lookup(idFromUrl);
    }
  }, []);

  async function lookup(idOverride) {
    const id = (idOverride || certId).trim();
    if (!id) return;
    setLoading(true);
    setLookupError("");
    setLookupResult(null);
    setTamperResult(null);
    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLookupError(data.error || "No certificate found matching that ID in registry.");
        setEditable(null);
      } else {
        setLookupResult(data);
        setEditable({ ...data.certificate });
      }
    } catch {
      setLookupError("Unable to communicate with the verification service.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file) {
    if (!file) return;
    setUploadError("");
    setLoading(true);
    setLookupResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        let payload;
        try {
          payload = JSON.parse(text);
        } catch {
          const match = text.match(/CERT-[A-Z0-9]+/i);
          if (match) {
            lookup(match[0]);
            return;
          } else {
            throw new Error("Could not parse certificate JSON metadata or certificate ID.");
          }
        }

        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setLookupResult({ valid: data.valid, certificate: payload });
          setEditable({ ...payload });
        } else {
          setUploadError(data.error || "Verification failed for this file.");
        }
      } catch (err) {
        setUploadError(err.message || "Failed to process uploaded file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }

  async function testTamperVerification() {
    setTamperLoading(true);
    setTamperResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editable),
      });
      const data = await res.json();
      setTamperResult(data);
    } catch {
      setTamperResult({ success: false, error: "Network error during signature verification." });
    } finally {
      setTamperLoading(false);
    }
  }

  function simulateNameAlteration() {
    if (!editable) return;
    setEditable({ ...editable, holderName: "Rahul Verma" });
  }

  function simulateCourseAlteration() {
    if (!editable) return;
    setEditable({ ...editable, course: editable.course + " (Distinction)" });
  }

  function restoreOriginalData() {
    if (!lookupResult?.certificate) return;
    setEditable({ ...lookupResult.certificate });
    setTamperResult(null);
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Public Verification Portal</h1>
        <p className="sub">
          Verify certificate integrity against the issuing university&apos;s cryptographic public key.
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "id" ? "active" : ""}`}
          onClick={() => setActiveTab("id")}
        >
          Verify by Certificate ID
        </button>
        <button
          className={`tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Certificate Metadata
        </button>
        <button
          className={`tab ${activeTab === "tamper" ? "active" : ""}`}
          onClick={() => setActiveTab("tamper")}
          disabled={!lookupResult}
        >
          Tamper-Detection Test
        </button>
      </div>

      {activeTab === "id" && (
        <div className="card">
          <label>Certificate ID</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CERT-MTIAUBYB"
              style={{ flex: 1 }}
            />
            <button onClick={() => lookup()} disabled={loading} style={{ marginTop: 0 }}>
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />} Check
            </button>
          </div>

          {lookupError && (
            <div className="result-banner result-invalid">
              <XCircle size={20} />
              <div>
                <div className="result-title">Record Not Found</div>
                <div className="result-desc">{lookupError}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "upload" && (
        <div className="card">
          <div
            className={`dropzone ${dragActive ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => document.getElementById("file-upload").click()}
          >
            <input
              id="file-upload"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <Upload size={32} color="#64748B" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>
              Click to browse or drop certificate file
            </div>
            <p className="hint">
              Supports metadata JSON files and certificates exported from Issuer portal
            </p>
          </div>

          {uploadError && (
            <div className="result-banner result-invalid">
              <XCircle size={20} />
              <div>
                <div className="result-title">Verification Error</div>
                <div className="result-desc">{uploadError}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {lookupResult && (
        <div className="card">
          {lookupResult.valid ? (
            <div className="result-banner result-valid" style={{ marginTop: 0 }}>
              <CheckCircle2 size={24} color="#16A34A" />
              <div>
                <div className="result-title">Valid Certificate — Signature Verified</div>
                <div className="result-desc">
                  The RSA-SHA256 signature matches the canonical metadata. This certificate is authentic and unmodified.
                </div>
              </div>
            </div>
          ) : (
            <div className="result-banner result-invalid" style={{ marginTop: 0 }}>
              <XCircle size={24} color="#DC2626" />
              <div>
                <div className="result-title">Invalid Signature — Verification Failed</div>
                <div className="result-desc">
                  The digital signature does not match the presented certificate data. The document has been altered or signed by an unknown entity.
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <div className="field-row">
              <span className="field-label">Certificate ID</span>
              <span className="field-val badge blue">{lookupResult.certificate.id}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Student Name</span>
              <span className="field-val">{lookupResult.certificate.holderName}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Degree</span>
              <span className="field-val">{lookupResult.certificate.course}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Issue Date</span>
              <span className="field-val">{lookupResult.certificate.issueDate}</span>
            </div>
          </div>

          <div className="btn-row">
            <a
              href={`/api/pdf?id=${lookupResult.certificate.id}`}
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              <Download size={14} /> Download PDF
            </a>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setActiveTab("tamper")}
            >
              Test Tampering Resistance
            </button>
          </div>
        </div>
      )}

      {activeTab === "tamper" && editable && (
        <div className="card">
          <h2>Tamper-Detection Test Interface</h2>
          <p className="hint" style={{ marginBottom: 14 }}>
            Modify any field below to observe how the RSA signature verification fails when the payload differs from the original issued record.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button type="button" className="btn-secondary" onClick={simulateNameAlteration} style={{ fontSize: 12, padding: "4px 10px" }}>
              Simulate Name Change
            </button>
            <button type="button" className="btn-secondary" onClick={simulateCourseAlteration} style={{ fontSize: 12, padding: "4px 10px" }}>
              Simulate Degree Alteration
            </button>
            <button type="button" className="btn-secondary" onClick={restoreOriginalData} style={{ fontSize: 12, padding: "4px 10px" }}>
              <RotateCcw size={12} /> Reset to Original
            </button>
          </div>

          <label>Student Name</label>
          <input
            value={editable.holderName}
            onChange={(e) => setEditable({ ...editable, holderName: e.target.value })}
          />

          <label>Course / Program</label>
          <input
            value={editable.course}
            onChange={(e) => setEditable({ ...editable, course: e.target.value })}
          />

          <label>Issue Date</label>
          <input
            type="date"
            value={editable.issueDate}
            onChange={(e) => setEditable({ ...editable, issueDate: e.target.value })}
          />

          <label>Digital Signature (Base64)</label>
          <textarea
            rows={3}
            value={editable.signature}
            onChange={(e) => setEditable({ ...editable, signature: e.target.value })}
          />

          <div className="btn-row">
            <button
              type="button"
              className="primary-accent"
              onClick={testTamperVerification}
              disabled={tamperLoading}
            >
              {tamperLoading ? "Re-Verifying Signature..." : "Verify Altered Payload"}
            </button>
          </div>

          {tamperResult && (
            <div className={`result-banner ${tamperResult.valid ? "result-valid" : "result-invalid"}`}>
              {tamperResult.valid ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <div>
                <div className="result-title">
                  {tamperResult.valid
                    ? "Signature Valid — Data Unaltered"
                    : "Tamper Detected — Signature Check Failed"}
                </div>
                <div className="result-desc">
                  {tamperResult.valid
                    ? "The presented data matches the cryptographic signature."
                    : "The computed SHA-256 digest of this data does not match the decrypted signature. The alteration has been mathematically rejected."}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
