const mongoose = require("mongoose");
const productHistoryModel = require("./productHistory.model");

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
    },
    product_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    unit_of_measure: {
      type: String,
      enum: ["kilograms", "litres", "units"],
      default: "units",
    },
    current_stock: {
      type: Number,
      default: 0,
    },

    current_count: {
      type: Number,
      default: 0,
    },

   
    lower_threshold: {
      type: Number,
      default: 0,
    },
    upper_threshold: {
      type: Number,
      default: 0,
    },
    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    sku_code: {
      type: String,
      required: true,
    },
    amazon_sku_code: {
      type: String,
    },
    shopify_sku_code: {
      type: String,
    },

    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterial",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save middleware
productSchema.pre('save', async function (next) {
  const product = this;

  if (product.isNew || product.isModified()) {
    const changes = product.toObject();

    delete changes._id; // Remove _id to avoid conflicts
    delete changes.__v; // Remove version key if present

    try {
      await productHistoryModel.create({
        product: product._id,
        changes: changes,
      });
    } catch (error) {
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});



// Create RawMaterials model
const Products = mongoose.model("Product", productSchema);

module.exports = Products;
