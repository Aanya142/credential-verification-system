const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

async function generateCertificatePdf(certData, qrCodeDataUrl) {
  // Create a new PDF Document in Landscape A4 (842 x 595 pt)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // Fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const navy = rgb(0.08, 0.15, 0.35); // #142659
  const gold = rgb(0.79, 0.63, 0.22); // #C9A138
  const darkGray = rgb(0.2, 0.23, 0.28);
  const lightGray = rgb(0.85, 0.88, 0.92);

  // Outer decorative border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: navy,
    borderWidth: 4,
  });

  // Inner gold border
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: gold,
    borderWidth: 1.5,
  });

  // Corner Accents (Gold corner brackets)
  const cornerSize = 25;
  const corners = [
    [35, 35],
    [width - 35 - cornerSize, 35],
    [35, height - 35 - cornerSize],
    [width - 35 - cornerSize, height - 35 - cornerSize],
  ];
  corners.forEach(([cx, cy]) => {
    page.drawRectangle({
      x: cx,
      y: cy,
      width: cornerSize,
      height: cornerSize,
      borderColor: gold,
      borderWidth: 1,
      color: rgb(0.98, 0.96, 0.91),
    });
  });

  // University Header
  const uniName = "MANIPAL UNIVERSITY JAIPUR";
  const uniSub = "DECENTRALIZED ACADEMIC CREDENTIAL VERIFICATION SYSTEM";
  const title = "CERTIFICATE OF ACHIEVEMENT";

  const uniWidth = timesRomanBold.widthOfTextAtSize(uniName, 26);
  page.drawText(uniName, {
    x: (width - uniWidth) / 2,
    y: height - 85,
    size: 26,
    font: timesRomanBold,
    color: navy,
  });

  const uniSubWidth = timesRomanItalic.widthOfTextAtSize(uniSub, 10);
  page.drawText(uniSub, {
    x: (width - uniSubWidth) / 2,
    y: height - 105,
    size: 10,
    font: timesRomanItalic,
    color: gold,
  });

  // Divider line
  page.drawLine({
    start: { x: 120, y: height - 118 },
    end: { x: width - 120, y: height - 118 },
    thickness: 1,
    color: gold,
  });

  // Certificate Title
  const titleWidth = timesRomanBold.widthOfTextAtSize(title, 20);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 150,
    size: 20,
    font: timesRomanBold,
    color: navy,
  });

  // "This is proudly presented to"
  const presentText = "This is to certify that";
  const presentWidth = timesRomanItalic.widthOfTextAtSize(presentText, 14);
  page.drawText(presentText, {
    x: (width - presentWidth) / 2,
    y: height - 190,
    size: 14,
    font: timesRomanItalic,
    color: darkGray,
  });

  // Recipient Name
  const nameText = certData.holderName.toUpperCase();
  const nameWidth = timesRomanBold.widthOfTextAtSize(nameText, 28);
  page.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: height - 235,
    size: 28,
    font: timesRomanBold,
    color: navy,
  });

  // Underline for name
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: height - 245 },
    end: { x: (width + nameWidth) / 2 + 20, y: height - 245 },
    thickness: 1.5,
    color: gold,
  });

  // Degree description
  const desc1 = `has successfully completed all academic requirements prescribed for the degree of`;
  const desc1Width = timesRomanFont.widthOfTextAtSize(desc1, 13);
  page.drawText(desc1, {
    x: (width - desc1Width) / 2,
    y: height - 275,
    size: 13,
    font: timesRomanFont,
    color: darkGray,
  });

  // Course Name
  const courseText = certData.course;
  const courseWidth = timesRomanBold.widthOfTextAtSize(courseText, 18);
  page.drawText(courseText, {
    x: (width - courseWidth) / 2,
    y: height - 305,
    size: 18,
    font: timesRomanBold,
    color: navy,
  });

  // Issue Date & ID info
  const infoText = `Conferred on ${certData.issueDate}  •  Certificate ID: ${certData.id}`;
  const infoWidth = timesRomanFont.widthOfTextAtSize(infoText, 11);
  page.drawText(infoText, {
    x: (width - infoWidth) / 2,
    y: height - 335,
    size: 11,
    font: timesRomanFont,
    color: darkGray,
  });

  // Embed QR Code Image
  if (qrCodeDataUrl) {
    const pngBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrImageBytes = Buffer.from(pngBase64, "base64");
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    // Position bottom-center-right
    const qrX = width - 180;
    const qrY = 65;
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: 95,
      height: 95,
    });

    page.drawText("Scan to verify cryptographic", {
      x: qrX - 15,
      y: qrY - 12,
      size: 8,
      font: timesRomanFont,
      color: darkGray,
    });
    page.drawText("RSA-SHA256 signature", {
      x: qrX + 3,
      y: qrY - 22,
      size: 8,
      font: timesRomanBold,
      color: navy,
    });
  }

  // University Signatures section (bottom-left)
  page.drawLine({
    start: { x: 75, y: 110 },
    end: { x: 235, y: 110 },
    thickness: 1,
    color: darkGray,
  });
  page.drawText("Registrar / Signing Authority", {
    x: 80,
    y: 92,
    size: 10,
    font: helveticaBold,
    color: navy,
  });
  page.drawText("Manipal University Jaipur", {
    x: 95,
    y: 78,
    size: 9,
    font: timesRomanFont,
    color: darkGray,
  });

  // Security Seal badge in the bottom center
  page.drawCircle({
    x: width / 2 - 20,
    y: 105,
    size: 36,
    borderColor: gold,
    borderWidth: 2,
    color: rgb(0.99, 0.98, 0.94),
  });
  page.drawText("OFFICIAL", {
    x: width / 2 - 42,
    y: 110,
    size: 9,
    font: helveticaBold,
    color: navy,
  });
  page.drawText("SEAL", {
    x: width / 2 - 32,
    y: 98,
    size: 9,
    font: helveticaBold,
    color: gold,
  });

  // Digital Signature footprint along very bottom
  const sigPreview = `Cryptographic Signature: ${certData.signature.substring(0, 75)}...`;
  page.drawText(sigPreview, {
    x: 45,
    y: 40,
    size: 6.5,
    font: courierFont,
    color: rgb(0.5, 0.55, 0.6),
  });

  return await pdfDoc.save();
}

module.exports = { generateCertificatePdf };
