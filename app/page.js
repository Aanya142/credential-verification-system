"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, FileCheck, ArrowRight, CheckCircle2, Lock } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({ totalCertificates: 0, recentCertificates: [] });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1>Decentralized Academic Credential Verification System</h1>
        <p className="sub">
          Public-key cryptographic verification platform for university degree certificates using RSA-SHA256 digital signatures.
        </p>

        <div className="btn-row">
          <Link href="/issue" className="btn btn-accent">
            <FileCheck size={16} /> Issue Certificate
          </Link>
          <Link href="/verify" className="btn btn-secondary">
            <Shield size={16} /> Verify Credential
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-num">{stats.totalCertificates}</div>
          <div className="stat-label">Registered Certificates</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">RSA-2048</div>
          <div className="stat-label">Signature Algorithm</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">SHA-256</div>
          <div className="stat-label">Hashing Standard</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>University Issuer Portal</h2>
          <p style={{ color: "#475569", fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
            Enables academic registrars to issue cryptographically signed degree certificates. The canonical metadata (holder name, course, conferral date) is hashed and signed with the university&apos;s private key.
          </p>
          <ul style={{ fontSize: 13, color: "#334155", paddingLeft: 18, lineHeight: 1.7, margin: "0 0 16px 0" }}>
            <li>Generates standard PDF certificates with embedded QR codes</li>
            <li>Produces verifiable RSA-SHA256 digital signatures</li>
            <li>Records issued metadata in the registry database</li>
          </ul>
          <Link href="/issue" className="btn btn-secondary" style={{ fontSize: 13 }}>
            Open Issuer Portal <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <h2>Public Verifier Portal</h2>
          <p style={{ color: "#475569", fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
            Allows employers, academic institutions, and credential evaluators to authenticate degrees instantly without contacting the issuing university.
          </p>
          <ul style={{ fontSize: 13, color: "#334155", paddingLeft: 18, lineHeight: 1.7, margin: "0 0 16px 0" }}>
            <li>Verify by Certificate ID or QR scan</li>
            <li>Direct file upload verification (JSON/PDF)</li>
            <li>Tamper detection testing interface</li>
          </ul>
          <Link href="/verify" className="btn btn-secondary" style={{ fontSize: 13 }}>
            Open Verifier <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>System Architecture &amp; Verification Protocol</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
          <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 6, border: "1px solid #E2E8F0" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", marginBottom: 4 }}>1. Issuance &amp; Signing</div>
            <div style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.5 }}>
              Certificate payload is canonicalized and signed using the institution&apos;s isolated 2048-bit RSA private key.
            </div>
          </div>
          <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 6, border: "1px solid #E2E8F0" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", marginBottom: 4 }}>2. Distribution &amp; QR</div>
            <div style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.5 }}>
              The student receives a PDF credential containing an embedded QR code pointing to the verification endpoint.
            </div>
          </div>
          <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 6, border: "1px solid #E2E8F0" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", marginBottom: 4 }}>3. Mathematical Validation</div>
            <div style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.5 }}>
              The verifier uses the public key to authenticate the signature. Any alteration to the document causes instant rejection.
            </div>
          </div>
        </div>
      </div>

      {stats.recentCertificates && stats.recentCertificates.length > 0 && (
        <div className="card">
          <h2>Recent Certificates in Registry</h2>
          <div style={{ marginTop: 12 }}>
            {stats.recentCertificates.map((cert) => (
              <div key={cert.id} className="field-row">
                <div>
                  <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 13.5 }}>{cert.holderName}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{cert.course} • {cert.id}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge green">Signed</span>
                  <Link href={`/verify?id=${cert.id}`} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>
                    Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
