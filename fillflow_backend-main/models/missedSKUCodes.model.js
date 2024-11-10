const mongoose = require('mongoose');

const missedSKUCodesSchema = new mongoose.Schema(
    { 
        sku_code: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('MissedSkuCodes', missedSKUCodesSchema);