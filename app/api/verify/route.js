import { NextResponse } from "next/server";
import { verifyCertificate } from "../../../lib/crypto";
import { findCertificateById } from "../../../lib/store";

// GET /api/verify?id=CERT-XXXX  -> looks up the stored certificate and verifies it
export async function GET(req) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing certificate id." }, { status: 400 });
  }
  const record = findCertificateById(id);
  if (!record) {
    return NextResponse.json({ success: false, error: "No certificate found with that ID." }, { status: 404 });
  }
  const { holderName, course, issueDate, signature } = record;
  const valid = verifyCertificate({ id, holderName, course, issueDate }, signature);
  return NextResponse.json({ success: true, valid, certificate: record });
}

// POST /api/verify  -> verifies arbitrary certificate data + signature the
// caller supplies directly. This is what powers the "tamper demo": you can
// edit a field client-side and see the signature check fail live.
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, holderName, course, issueDate, signature } = body;
    if (!id || !holderName || !course || !issueDate || !signature) {
      return NextResponse.json({ success: false, error: "All certificate fields and a signature are required." }, { status: 400 });
    }
    const valid = verifyCertificate({ id, holderName, course, issueDate }, signature);
    return NextResponse.json({ success: true, valid });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Something went wrong verifying the certificate." }, { status: 500 });
  }
}
