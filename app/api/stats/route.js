import { NextResponse } from "next/server";
import { readAll } from "../../../lib/store";
import { getUniversityKeys } from "../../../lib/crypto";

export async function GET() {
  const all = readAll();
  const keys = getUniversityKeys();

  return NextResponse.json({
    totalCertificates: all.length,
    recentCertificates: all.slice(-5).reverse(),
    issuerName: keys.universityName || "Manipal University Jaipur",
    algorithm: "RSA-SHA256 (2048-bit)",
    status: "Healthy",
  });
}
