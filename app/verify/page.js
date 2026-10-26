"use client";
import { useState, useEffect } from "react";
import { Search, Upload, CheckCircle2, XCircle, RefreshCw, Download, RotateCcw, ShieldCheck, Flame, Bug } from "lucide-react";

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
      setLookupError("Unable to communicate with the verification node.");
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
    setEditable({ ...editable, holderName: "Malicious Hacker" });
  }

  function simulateCourseAlteration() {
    if (!editable) return;
    setEditable({ ...editable, course: editable.course + " (Summa Cum Laude - FORGED)" });
  }

  function restoreOriginalData() {
    if (!lookupResult?.certificate) return;
    setEditable({ ...lookupResult.certificate });
    setTamperResult(null);
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={30} color="#F97316" /> Public Verification Node
        </h1>
        <p className="sub">
          Verify academic credential integrity against the issuing university&apos;s 2048-bit RSA public key.
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "id" ? "active" : ""}`}
          onClick={() => setActiveTab("id")}
        >
          <Search size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Audit by ID
        </button>
        <button
          className={`tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <Upload size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Drop Credential File
        </button>
        <button
          className={`tab ${activeTab === "tamper" ? "active" : ""}`}
          onClick={() => setActiveTab("tamper")}
          disabled={!lookupResult}
        >
          <Flame size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Tamper-Testing Lab
        </button>
      </div>

      {activeTab === "id" && (
        <div className="card">
          <label>Certificate ID</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CERT-MVPM72QNOI0"
              style={{ flex: 1 }}
            />
            <button onClick={() => lookup()} disabled={loading} style={{ marginTop: 0 }}>
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />} Check
            </button>
          </div>

          {lookupError && (
            <div className="result-banner result-invalid">
              <XCircle size={22} />
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
            <Upload size={32} color="#F97316" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#18181B" }}>
              Drop your Certificate File or Click to Browse
            </div>
            <p className="hint">
              Upload JSON metadata exports or sample certificate files
            </p>
          </div>

          {uploadError && (
            <div className="result-banner result-invalid">
              <XCircle size={22} />
              <div>
                <div className="result-title">Verification Error</div>
                <div className="result-desc">{uploadError}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {lookupResult && (
        <div className="card" style={{ border: lookupResult.valid ? "2px solid #059669" : "2px solid #DC2626" }}>
          {lookupResult.valid ? (
            <div className="result-banner result-valid" style={{ marginTop: 0 }}>
              <CheckCircle2 size={26} color="#059669" />
              <div>
                <div className="result-title" style={{ fontSize: 16 }}>
                  VALID CERTIFICATE — SIGNATURE VERIFIED
                </div>
                <div className="result-desc">
                  The digital signature matches the university&apos;s public key. The degree is authentic and has not been modified.
                </div>
              </div>
            </div>
          ) : (
            <div className="result-banner result-invalid" style={{ marginTop: 0 }}>
              <XCircle size={26} color="#DC2626" />
              <div>
                <div className="result-title" style={{ fontSize: 16 }}>
                  FORGERY / TAMPERING DETECTED!
                </div>
                <div className="result-desc">
                  The SHA-256 digest does not match the decrypted RSA signature. This certificate has been altered!
                </div>
              </div>
            </div>
          )}

          <div style={{ margin: "20px 0" }}>
            <div className="field-row">
              <span className="field-label">Certificate ID</span>
              <span className="field-val badge orange">{lookupResult.certificate.id}</span>
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
              <Download size={14} /> Download Official PDF
            </a>
            <button
              type="button"
              className="btn yellow"
              onClick={() => setActiveTab("tamper")}
            >
              <Flame size={14} /> Test Tampering Resistance
            </button>
          </div>
        </div>
      )}

      {activeTab === "tamper" && editable && (
        <div className="card" style={{ border: "2px solid #F97316" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Bug size={22} color="#EA580C" />
            <h2 style={{ margin: 0, fontSize: 17 }}>Interactive Tamper-Detection Laboratory</h2>
          </div>
          <p className="hint" style={{ marginBottom: 16 }}>
            Modify any field below to observe how RSA signature verification mathematically fails when payload data is changed.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button type="button" className="btn-secondary" onClick={simulateNameAlteration} style={{ fontSize: 12, padding: "4px 10px" }}>
              ⚡ Change Student Name
            </button>
            <button type="button" className="btn-secondary" onClick={simulateCourseAlteration} style={{ fontSize: 12, padding: "4px 10px" }}>
              ⚡ Alter Degree / Major
            </button>
            <button type="button" className="btn-secondary" onClick={restoreOriginalData} style={{ fontSize: 12, padding: "4px 10px" }}>
              <RotateCcw size={12} /> Reset Original
            </button>
          </div>

          <label>Student Name</label>
          <input
            value={editable.holderName}
            onChange={(e) => setEditable({ ...editable, holderName: e.target.value })}
          />

          <label>Course / Degree</label>
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

          <label>RSA Digital Signature (Base64)</label>
          <textarea
            rows={3}
            value={editable.signature}
            onChange={(e) => setEditable({ ...editable, signature: e.target.value })}
          />

          <div className="btn-row">
            <button
              type="button"
              className="danger"
              onClick={testTamperVerification}
              disabled={tamperLoading}
              style={{ width: "100%", padding: "13px" }}
            >
              {tamperLoading ? "Checking SHA-256 with Public Key..." : "🔬 Test Cryptographic Signature Validity"}
            </button>
          </div>

          {tamperResult && (
            <div className={`result-banner ${tamperResult.valid ? "result-valid" : "result-invalid"}`}>
              {tamperResult.valid ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
              <div>
                <div className="result-title">
                  {tamperResult.valid
                    ? "SIGNATURE MATCHES — NO TAMPERING DETECTED"
                    : "TAMPERING CONFIRMED — SIGNATURE REJECTED!"}
                </div>
                <div className="result-desc">
                  {tamperResult.valid
                    ? "The presented payload data matches the digital signature."
                    : "Mathematical check failed: SHA-256 hash does not match the decrypted RSA signature. Forgery caught!"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
