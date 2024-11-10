const Product = require('../models/product.model');
const PDFDocument = require('pdfkit');
const QRCode = require('qr-image');
const moment = require('moment');
const QRCodeRecords = require('../models/qrCodeRecords.model');

exports.generateQRCode = async (req, res) => {
  try {
    const reqBodyData = req.body;
    const user = req.user.data._id;
    const currentDate = moment().format('YYYY-MM-DD');
    const productDetail = await Product.findById(reqBodyData.formData.product_id);

    if (!productDetail) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const skuCode = productDetail.sku_code;
    const productTitle = productDetail.product_name.slice(0, 15);
    const quantity = reqBodyData.formData.qrQuantity;
    let currentCount = productDetail.current_count;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity',
      });
    }

    // Increment currentCount by 1
    currentCount++;

    // Page dimensions in points (75mm x 50mm)
    const pageWidth = (75 / 25.4) * 72;
    const pageHeight = (50 / 25.4) * 72;

    const doc = new PDFDocument({ size: [pageWidth, pageHeight], margin: 0 });

    // Buffer to store the PDF data
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);

      // Send the PDF as an attachment
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="QR_Codes_${skuCode}_${currentDate}.pdf"`
      );
      res.status(200).send(pdfData);
    });

    // Set font size for text
    doc.fontSize(8);

    for (let i = 0; i < quantity; i++) {
      const qrData = `${skuCode}|${currentDate}|${currentCount}`;
      const qrImageBuffer = QRCode.imageSync(qrData, { type: 'png' });

      // Add QR code image
      doc.image(qrImageBuffer, 5, 5, { width: 100, height: 100 });

      // Creating QRCodeRecord in the database using create()
      await QRCodeRecords.create({
        qr_code: qrData,
        product_id: reqBodyData.formData.product_id,
        current_status: 'Pending',
        created_by: user,
      });

      // Add text description
      doc.fontSize(8).text(`SKU: ${skuCode}`, 100, 20);
      doc.fontSize(8).text(`Name: ${productTitle}`, 100, 30);
      doc.fontSize(8).text(`Date: ${currentDate}`, 100, 40);
      doc.fontSize(8).text(`Count: ${currentCount}`, 100, 50);
      doc.fontSize(6).text(`Batch Number`, 100, 60);
      doc.fontSize(6).text(`Quantity`, 150, 60);
      reqBodyData.listData.slice(0, 10).map((data, indx) => {
        const yPosition = 68 + indx * 7; // Calculate y-axis position dynamically
        doc.fontSize(6).text(`${data.batchNumber}`, 100, yPosition);
        doc.fontSize(6).text(`${data.quantity}`, 150, yPosition);
      });

      // Increment currentCount by 1 for the next QR code
      currentCount++;

      if (i < quantity - 1) {
        doc.addPage();
      }
    }

    // Update productDetail current_count and save
    productDetail.current_count = Number(productDetail.current_count) + Number(quantity);
    await productDetail.save();

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the QR codes',
      error: error.message,
    });
  }
};
