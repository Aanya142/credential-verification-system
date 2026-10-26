"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Award, Key, FileCheck } from "lucide-react";

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
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-pill">
          ● Public-Key Cryptography Protocol
        </div>
        <h1>
          Decentralized Academic<br />
          <span>Credential Verification</span>
        </h1>
        <p>
          Instant degree verification without intermediaries. Issue tamper-evident credentials, 
          embed cryptographic QR codes, and verify degrees using 2048-bit RSA digital signatures.
        </p>

        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link href="/issue" className="btn">
            <Award size={18} /> Issue Certificate
          </Link>
          <Link href="/verify" className="btn btn-secondary">
            <Shield size={18} /> Public Verifier
          </Link>
        </div>
      </div>

      {/* Stat Boxes */}
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-num">{stats.totalCertificates}</div>
          <div className="stat-label">Registered Credentials</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: "#EAB308" }}>2048-bit</div>
          <div className="stat-label">RSA Asymmetric Key</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: "#16A34A" }}>$0.00</div>
          <div className="stat-label">Verification Cost</div>
        </div>
      </div>

      {/* Portal Cards */}
      <div className="grid-2">
        <div className="card card-hover">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ 
              background: "#FFEDD5", 
              border: "1.5px solid #F97316", 
              padding: "8px", 
              borderRadius: "6px",
              boxShadow: "2px 2px 0px #18181B"
            }}>
              <Award size={22} color="#C2410C" />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>University Issuer Portal</h2>
              <div style={{ fontSize: 12, color: "#71717A" }}>Authorized Degree Minting</div>
            </div>
          </div>
          <p style={{ color: "#52525B", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
            Enables academic registrars to issue cryptographically signed degree certificates. 
            Serializes canonical student details, signs them with the private key, and exports an official high-resolution PDF with embedded QR code.
          </p>
          <Link href="/issue" className="btn" style={{ width: "100%" }}>
            Go to Issuer Portal <ArrowRight size={16} />
          </Link>
        </div>

        <div className="card card-hover">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ 
              background: "#FEF9C3", 
              border: "1.5px solid #EAB308", 
              padding: "8px", 
              borderRadius: "6px",
              boxShadow: "2px 2px 0px #18181B"
            }}>
              <Shield size={22} color="#854D0E" />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Public Verifier Node</h2>
              <div style={{ fontSize: 12, color: "#71717A" }}>Trustless Degree Auditing</div>
            </div>
          </div>
          <p style={{ color: "#52525B", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
            Enables employers and universities to authenticate degrees in milliseconds. 
            Upload a certificate metadata file, scan the QR, or run live tamper-detection attacks to observe signature rejection.
          </p>
          <Link href="/verify" className="btn btn-secondary" style={{ width: "100%" }}>
            Open Verifier <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Protocol Architecture Banner */}
      <div className="card" style={{ background: "#FFFDF9", border: "2px solid #F97316" }}>
        <h2 style={{ fontSize: 17, marginBottom: 16 }}>Cryptographic Verification Flow</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div style={{ background: "#FFFFFF", padding: 16, border: "1.5px solid #18181B", borderRadius: 6, boxShadow: "2px 2px 0px #18181B" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#EA580C", marginBottom: 4 }}>1. Canonical Hashing</div>
            <div style={{ fontSize: 12.5, color: "#52525B", lineHeight: 1.5 }}>
              Student identity and graduation details are ordered into canonical JSON and hashed with SHA-256.
            </div>
          </div>

          <div style={{ background: "#FFFFFF", padding: 16, border: "1.5px solid #18181B", borderRadius: 6, boxShadow: "2px 2px 0px #18181B" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#CA8A04", marginBottom: 4 }}>2. Private Key Signing</div>
            <div style={{ fontSize: 12.5, color: "#52525B", lineHeight: 1.5 }}>
              The institution signs the hash with its 2048-bit Private Key, generating an unforgeable digital signature.
            </div>
          </div>

          <div style={{ background: "#FFFFFF", padding: 16, border: "1.5px solid #18181B", borderRadius: 6, boxShadow: "2px 2px 0px #18181B" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#16A34A", marginBottom: 4 }}>3. Public Verification</div>
            <div style={{ fontSize: 12.5, color: "#52525B", lineHeight: 1.5 }}>
              The verifier checks the signature against the university&apos;s Public Key. Altering 1 character causes immediate rejection.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registry Activity */}
      {stats.recentCertificates && stats.recentCertificates.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>Recent Certificates in Registry</h2>
            <span style={{ fontSize: 12, color: "#71717A", fontWeight: 600 }}>Ledger Active</span>
          </div>

          <div>
            {stats.recentCertificates.map((cert) => (
              <div key={cert.id} className="field-row">
                <div>
                  <div style={{ fontWeight: 700, color: "#18181B", fontSize: 14 }}>{cert.holderName}</div>
                  <div style={{ fontSize: 12, color: "#71717A" }}>{cert.course} • <span style={{ fontFamily: "monospace", color: "#EA580C" }}>{cert.id}</span></div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="badge green"><CheckCircle2 size={12} /> Verified</span>
                  <Link href={`/verify?id=${cert.id}`} className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }}>
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
