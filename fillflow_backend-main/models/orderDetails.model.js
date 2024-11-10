const mongoose = require('mongoose');

const orderDetailsSchema = new mongoose.Schema(
    { 
        orderId: {
            type: String,
            required: true,
        },
        awbNumber: {
            type: String,
        },
        referenceCode: {
            type: String,
        },
        fulfilledQRCodes: [
            {
                skuCode: {
                    type: String,
                },
                qrCode: {
                    type: String,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('OrderDetails', orderDetailsSchema);


