const mongoose = require('mongoose');
const OrderHistory = require('./orderHistory.model');

const orderSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['Custom', 'Custom - Amazon', 'Custom - EasyEcom', 'B2B'],
      required: true,
    },

    AWB: {
      type: [String],
    },

    orderDate: {
      type: String,
    },

    scheduledDispatchDate: {
      type: String,
    },

    fulfilledAt: {
      type: String,
    },

    orderTitle: {
      type: String,
    },

    batchID :{
      type: String,
    },

    fulfillOrderQrCodes: [
      {
        skuCode: {
          type: String,
        },
        qrCode: {
          type: String,
        },
      },
    ],

    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    listOfProducts: [
      {
        skuCode: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        fulfilledQuantity: {
          type: Number,
        },
    
      },
    ],

    subOrderNumber: {
      type: [String],
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Initialize as an empty object by default
    },
    status: {
      type: String,
      default: 'open',
      enum: ['closed', 'open', 'shipped','picked'],
    },
    retailer : {
      type : String
    },
    location : {
      type : String
    },
    trackingNumber : {
      type : String
    },
    remarks : {
      type : String
    },

  },
  {
    timestamps: true,
  }
);

// // mantaining the history of the changes in order model
// orderSchema.pre('save', async function (next) {
//   const order = this;
//   console.log("🚀 ~ this:", this);
//   if (order.isNew() || order.isModified()) {
//     const changes = order.toObject();
//     console.log("🚀 ~ changes:", changes);
//     delete changes._id; // Remove _id to avoid conflicts
//     delete changes.__v; // Remove version key if present

//     try {
//       await OrderHistory.create({

//         order: order._id,
//         changes: changes,
//       });
//     } catch (error) {
//       return next(error); // Pass the error to the next middleware
//     }
//   }
//   next();
// });

// Create Category model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
