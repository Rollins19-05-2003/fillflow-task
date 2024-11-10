// Import the necessary models
const QRCodeRecords = require("../models/qrCodeRecords.model");
const Product = require('../models/product.model');
const OutwardedProducts = require('../models/outwardedProducts.model');

/**
 * Get all QR code records.
 * 
 * This function retrieves all QR code records stored in the database. It queries the
 * `QRCodeRecords` collection and returns all documents found. The records are then sent back
 * to the client with a success status. In case of an error during retrieval, a 500 status
 * code is sent with an "Internal Server Error" message.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getAllQRCodeRecords = async (req, res) => {
    try {
        console.log("Hit inside get all QR code records");

        // Retrieve records where current_status is not 'Inwarded'
        const qrCodeRecords = await QRCodeRecords.find(
            {}, // Filter condition
            'qr_code current_status' // Projection to return only relevant fields
        ).lean().exec();

        res.status(200).send({ success: true, data: qrCodeRecords });
    } catch (error) {
        console.error("Error retrieving QR code records:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};


exports.updateQRCodeStatus = async (req, res) => {
    console.log("Hit inside update qr code status");
    const qrCodes = req.body;
    const productDetailsMap = new Map(); // To group products by product_id

    try {
        // Iterate through each QR code provided in the request body
        for (const key of Object.keys(qrCodes)) {
            const qrCode = qrCodes[key];
            // Find the QR code record by its QR code value
            const qrCodeRecord = await QRCodeRecords.findOne({ qr_code: qrCode });

            if (qrCodeRecord && qrCodeRecord.current_status === "Inwarded") {
                // Update the current status to "Outwarded" and mark it as outwarded
                qrCodeRecord.current_status = "Outwarded";
                qrCodeRecord.is_outwarded = true;

                // Save the updated QR code record to the database
                await qrCodeRecord.save();

                // Find the corresponding product by its ID
                const product = await Product.findOne({ _id: qrCodeRecord.product_id });
                console.log("Product:", product);

                if (product) {
                    // Decrement the product's current stock by 1
                    product.current_stock -= 1;
                    const productName = product.product_name;
                    // Save the updated product information to the database
                    await product.save();

                    // Group products by product_id and collect SKU codes
                    if (productDetailsMap.has(product._id.toString())) {
                        const detail = productDetailsMap.get(product._id.toString());
                        detail.quantity += 1;
                        detail.sku_codes.push(qrCode); // Add QR code to the existing product detail
                    } else {
                        // Initialize a new entry for this product
                        productDetailsMap.set(product._id.toString(), {
                            product_id: product._id,
                            product_name: productName,
                            quantity: 1,
                            sku_codes: [qrCode]
                        });
                    }
                } else {
                    console.error(`Product with id ${qrCodeRecord.product_id} not found.`);
                }
            } else {
                console.error(`QR code ${qrCode} not found or not "Inwarded"`);
            }
        }

        // Create an array of product details from the map
        const productDetails = Array.from(productDetailsMap.values());

        const outwardedProductID = await OutwardedProducts.generateNextID();


        // Create a new entry in the OutwardedProducts collection
        const outwardedProductsEntry = new OutwardedProducts({
            outwarded_products_id: outwardedProductID,
            products: productDetails
        });

        // Save the new entry to the database
        await outwardedProductsEntry.save();

        console.log("Reached the end of update qr code status");
        // Send a success response if all QR code statuses were updated successfully
        res.status(200).send({ success: true, message: "QR code statuses updated successfully" });
    } catch (error) {
        console.error("Error updating QR code statuses:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

/**
 * Get QR code records by product IDs.
 * 
 * This function receives an array of product IDs and retrieves all QR code records associated with
 * those product IDs. The records are then sent back to the client with a success status. In case 
 * of an error during retrieval, a 500 status code is sent with an "Internal Server Error" message.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getQRCodeRecordsByProductIds = async (req, res) => {
    const productIds = req.body.productIds;

    try {
        // Retrieve all QR code records associated with the provided product IDs
        const qrCodeRecords = await QRCodeRecords.find({ product_id: { $in: productIds } });

        // Send the retrieved records with a success status
        res.status(200).send({ success: true, data: qrCodeRecords });
    } catch (error) {
        // Log the error and send an error status in case of any issues during retrieval
        console.error("Error fetching QR code records:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};



exports.streamQRCodeRecords = async (req, res) => {
    try {
        console.log("Starting stream of QR code records");

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Create a cursor to retrieve documents in real-time
        const cursor = QRCodeRecords.find({}, 'qr_code current_status')
            .sort({ createdAt: -1 }) // Sort to get the latest documents first
            .lean()
            .cursor();

        // Stream data to the client
        cursor.eachAsync(async (doc) => {
            res.write(`data: ${JSON.stringify(doc)}\n\n`); // Send each document as an SSE
        });



        // Close the connection on client disconnect
        req.on('close', () => {
            res.end();
            console.log("Client disconnected, stopping stream.");
        });

    } catch (error) {
        console.error("Error streaming QR code records:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};
