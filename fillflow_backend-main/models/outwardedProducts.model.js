// models/OutwardedToDispatch.js
const mongoose = require('mongoose');

const ProductDetailSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // Ensure the quantity is at least 1
    },
    sku_codes: {
        type: [String], // Array of SKU codes
        required: true
    }
}, { _id: false }); // Disable automatic ID generation for nested schema

const OutwardedProductsSchema = new mongoose.Schema({
    outwarded_products_id: {
        type: String,
        required: true,
    },
    products: {
        type: [ProductDetailSchema],
        required: true // Ensure at least one product detail is provided
    },
    created_at: {
        type: Date,
        default: Date.now // Automatically set to the current date and time when created
    },
});



// Static method to generate the next outwarded product ID
OutwardedProductsSchema.statics.generateNextID = async function() {
    const latestEntry = await this.findOne().sort({ created_at: -1 }).select('outwarded_products_id');
    const latestID = latestEntry ? latestEntry.outwarded_products_id : 'OTD-0'; // Default to OTD-0 if no entry exists
    const nextIDNumber = parseInt(latestID.split('-')[1]) + 1; // Increment the numeric part
    return `OTD-${nextIDNumber}`; // Return the new ID
};

const OutwardedProducts = mongoose.model('OutwardedProducts', OutwardedProductsSchema);
module.exports = OutwardedProducts;
