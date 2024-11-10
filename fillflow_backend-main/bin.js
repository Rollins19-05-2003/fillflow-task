const Product = require("../models/product.model");
const PDFDocument = require("pdfkit");
const QRCode = require("qr-image");

exports.generateQRCode = async (req, res) => {
  const reqBodydata = req.body;

  const productDetail = await Product.findById(reqBodydata.product_id);
  if (!productDetail) {
    return res.status(404).json({
      success: false,
      message: "Product is not found",
    });
  }

  const skucode = productDetail.sku_code;
  const batchNo = reqBodydata.batchNo;
  const quantity = reqBodydata.quantity;
  let currentCount = productDetail.current_count;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid quantity",
    });
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="QR_Codes_${skucode}_${batchNo}.pdf"`
  );

  doc.pipe(res);

  // Set font size and line height for text
  doc.fontSize(10);
  // doc.lineHeight(12);

  for (let i = 0; i < quantity; i++) {
    const qrData = `${skucode}|${batchNo}|${currentCount}`;
    const qrImage = QRCode.imageSync(qrData, { type: "png" });

    // Add QR code image
    doc.image(qrImage, 50, 50 + i * 100, { width: 100, height: 100 });

    // Add text description
    doc.text(`SKU Code: ${skucode}`, 180, 60 + i * 100);
    doc.text(`Batch Number: ${batchNo}`, 180, 80 + i * 100);
    doc.text(`Current Count: ${currentCount}`, 180, 100 + i * 100);

    // Increment currentCount for each QR code generated
    currentCount++;
  }

  doc.end();
};
