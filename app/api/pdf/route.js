import { NextResponse } from "next/server";
import { findCertificateById } from "../../../lib/store";
import { generateCertificatePdf } from "../../../lib/pdfGenerator";
import QRCode from "qrcode";

export async function GET(req) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing certificate ID" }, { status: 400 });
  }

  const cert = findCertificateById(id);
  if (!cert) {
    return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });
  }

  try {
    const origin = req.nextUrl.origin;
    const verifyUrl = `${origin}/verify?id=${encodeURIComponent(id)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 250 });

    const pdfBytes = await generateCertificatePdf(cert, qrCodeDataUrl);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.id}-${cert.holderName.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 });
  }
}
