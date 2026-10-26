import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Academic Credential Verification System",
  description: "Cryptographic Certificate Issuance & Verification using RSA-SHA256 digital signatures.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="brand-icon">✓</span>
            <span>Academic Credential Verification</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Overview</Link>
            <Link href="/issue">Issue Certificate</Link>
            <Link href="/verify">Verify</Link>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
