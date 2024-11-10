const mongoose = require('mongoose');

const productMappingSchema = new mongoose.Schema(
    {
        easycomSKU: {
            type: String,
            required: true,
        },
        easycomQuantity: {
            type: Number,
            required: true,
        },
        imsMappings: [
            {
                imsSKU: {
                    type: String,
                    required: true,
                },
                imsQuantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('productMapping', productMappingSchema);
