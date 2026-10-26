"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Award, FileSearch, ArrowRight, CheckCircle2, Lock, Cpu, Sparkles, KeyRound } from "lucide-react";

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
        <div className="badge-pill">
          <Sparkles size={14} color="#818CF8" /> Public-Key Cryptography Protocol
        </div>
        <h1>Decentralized Academic<br />Credential Verification</h1>
        <p>
          Next-generation degree authentication without intermediaries. Issue tamper-evident credentials, embed cryptographic QR codes, and verify certificates in <b>0 ms</b> with zero gas fees.
        </p>

        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link href="/issue" className="btn">
            <Award size={18} /> Launch Issuer Portal
          </Link>
          <Link href="/verify" className="btn btn-secondary">
            <FileSearch size={18} /> Public Verifier Node
          </Link>
        </div>
      </div>

      {/* Futuristic Stat Counters */}
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-num">{stats.totalCertificates}</div>
          <div className="stat-label">Credentials On Registry</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ background: "linear-gradient(135deg, #06B6D4, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            2048-bit
          </div>
          <div className="stat-label">RSA Asymmetric Security</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ background: "linear-gradient(135deg, #10B981, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            $0.00
          </div>
          <div className="stat-label">Verification Cost / Fee</div>
        </div>
      </div>

      {/* Main Portals Split */}
      <div className="grid-2">
        <div className="card card-hover">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818CF8" }}>
              <Award size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19 }}>Issuer Authority</h2>
              <div style={{ fontSize: 12, color: "#64748B" }}>University Admin Portal</div>
            </div>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Authorize and cryptographically sign academic degrees. Automatically encodes canonical SHA-256 metadata, applies the institution&apos;s private key, and exports an official high-resolution PDF certificate.
          </p>
          <Link href="/issue" className="btn" style={{ width: "100%" }}>
            Mint Certificate <ArrowRight size={16} />
          </Link>
        </div>

        <div className="card card-hover">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22D3EE" }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19 }}>Universal Verifier</h2>
              <div style={{ fontSize: 12, color: "#64748B" }}>Public Auditing Node</div>
            </div>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Instant, trustless authentication for employers and embassies. Upload a certificate file or scan its QR code to mathematically verify the signature against the university&apos;s public key.
          </p>
          <Link href="/verify" className="btn btn-secondary" style={{ width: "100%" }}>
            Authenticate Credential <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Protocol Architecture Banner */}
      <div className="card glow-border" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Cpu size={22} color="#818CF8" />
          <h2 style={{ margin: 0 }}>Cryptographic Integrity Protocol</h2>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, color: "#818CF8", fontSize: 14, marginBottom: 6 }}>1. Canonical Payload</div>
            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
              Student identity and conferral details are serialized in deterministic order and hashed with SHA-256.
            </div>
          </div>

          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, color: "#22D3EE", fontSize: 14, marginBottom: 6 }}>2. Asymmetric Signing</div>
            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
              The digest is encrypted using the issuing institution&apos;s 2048-bit Private Key, generating an unforgeable digital signature.
            </div>
          </div>

          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, color: "#34D399", fontSize: 14, marginBottom: 6 }}>3. Universal Verification</div>
            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
              The verifier node checks the signature with the public key. If a forged certificate modifies even 1 byte, verification fails immediately.
            </div>
          </div>
        </div>
      </div>

      {/* Live Registry Feed */}
      {stats.recentCertificates && stats.recentCertificates.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Recent Registry Activity</h2>
            <span style={{ fontSize: 12, color: "#64748B" }}>Live ledger updates</span>
          </div>

          <div>
            {stats.recentCertificates.map((cert) => (
              <div key={cert.id} className="field-row">
                <div>
                  <div style={{ fontWeight: 700, color: "#F8FAFC", fontSize: 14 }}>{cert.holderName}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{cert.course} • <span style={{ fontFamily: "monospace", color: "#818CF8" }}>{cert.id}</span></div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="badge green"><CheckCircle2 size={12} /> Verified</span>
                  <Link href={`/verify?id=${cert.id}`} className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>
                    Audit
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
