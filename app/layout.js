import "./globals.css";
import Link from "next/link";
import { ShieldCheck, Award, FileSearch } from "lucide-react";

export const metadata = {
  title: "TrustCert • Decentralized Credential Verification",
  description: "Cryptographic Certificate Issuance & Verification using 2048-bit RSA-SHA256 digital signatures.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="brand">
            <div className="brand-icon">
              <ShieldCheck size={20} />
            </div>
            <span>Trust<b>Cert</b></span>
            <span className="brand-pill">RSA-2048</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/issue">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Award size={15} /> Issue Degree
              </span>
            </Link>
            <Link href="/verify">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FileSearch size={15} /> Verifier
              </span>
            </Link>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
