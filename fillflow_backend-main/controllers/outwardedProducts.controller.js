// Import the necessary models
const OutwardedProducts = require('../models/outwardedProducts.model');

/**
 * Get all outwarded products.
 * 
 * This function retrieves all outwarded products stored in the database. It queries the
 * `OutwardedProducts` collection and returns all documents found. The records are then sent back
 * to the client with a success status. In case of an error during retrieval, a 500 status
 * code is sent with an "Internal Server Error" message.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getAllOutwardedProducts = async (req, res) => {
    try {

      console.log ("hit");
        // Retrieve all outwarded products from the database
        const outwardedProducts = await OutwardedProducts.find({});
        // Send the retrieved records with a success status
        res.status(200).send({ success: true, data: outwardedProducts });
    } catch (error) {
        // Send an error status in case of any issues during retrieval
        res.status(500).send({ error: "Internal Server Error" });
    }
};
