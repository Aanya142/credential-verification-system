import { NextResponse } from "next/server";
import { signCertificate } from "../../../lib/crypto";
import { saveCertificate } from "../../../lib/store";
import QRCode from "qrcode";

export async function POST(req) {
  try {
    const body = await req.json();
    const { holderName, course, issueDate } = body;

    if (!holderName || !course || !issueDate) {
      return NextResponse.json(
        { success: false, error: "holderName, course, and issueDate are all required." },
        { status: 400 }
      );
    }

    const id = "CERT-" + Date.now().toString(36).toUpperCase();
    const certData = { id, holderName, course, issueDate };

    const signature = signCertificate(certData);

    const record = { ...certData, signature, createdAt: new Date().toISOString() };
    saveCertificate(record);

    const verifyUrl = `${req.nextUrl.origin}/verify?id=${id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

    return NextResponse.json({ success: true, certificate: record, verifyUrl, qrCodeDataUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Something went wrong issuing the certificate." }, { status: 500 });
  }
}
