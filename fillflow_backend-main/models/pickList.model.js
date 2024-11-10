const mongoose = require("mongoose");

const skuSchema = new mongoose.Schema({
  skuCode: {
    type: String,
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
  },
});

const picklistSchema = new mongoose.Schema({
  orderIds: {
    type: [String],
    required: true,
  },

  pickListumber: {
    type: String,
    required: true,
  },

  skus: [skuSchema],

  fulfillPickListQrCodes: [
    {
      skuCode: {
        type: String,
        required: true,
      },
      qrCode: {
        type: String,
        required: true,
      },
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "fulfilled"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

picklistSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Picklist = mongoose.model("Picklist", picklistSchema);

module.exports = Picklist;
