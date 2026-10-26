import "./globals.css";
import Link from "next/link";
import { CheckSquare } from "lucide-react";

export const metadata = {
  title: "TrustCert • Academic Credential Verification",
  description: "Cryptographic Certificate Issuance & Verification using RSA-SHA256 digital signatures.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="brand">
            <span style={{ 
              background: "#F97316", 
              color: "white", 
              padding: "4px 8px", 
              borderRadius: "4px", 
              border: "1.5px solid #18181B",
              boxShadow: "2px 2px 0px #18181B"
            }}>
              ✓
            </span>
            <span>Trust<b>Cert</b></span>
            <span className="brand-badge">RSA-2048</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/issue">Issue Certificate</Link>
            <Link href="/verify">Verify</Link>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
