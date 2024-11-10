const mongoose = require('mongoose');

const rtoOrderSchema = new mongoose.Schema(
    {
        orderId: {
        type: String,
        required: true,
        },
        awbNumber: {
        type: String,
        required: true,
        },
        sourcePlatform: {
        type: String,
        required: true,
        },
        logisticsPartner: {
        type: String,
        required: true,
        },
        returnedItems: [
        {
            sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RawMaterials",

            },
            quantity: {
            type: Number,
            },
        },
        ],
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          incompleteOrder: {
            type: Boolean,
            default: false,
          },

    },
    {
        timestamps: true,
    }
    );

module.exports = mongoose.model('RTOOrder', rtoOrderSchema);