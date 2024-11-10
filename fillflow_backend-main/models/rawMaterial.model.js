const mongoose = require('mongoose');
const RawMaterialOrderHistory = require('./rawMaterialHistory.model'); // Import the RawMaterialOrderHistory model

const rawMaterialsSchema = new mongoose.Schema(
  {
    material_name: {
      type: String,
      required: true,
    },
    material_description: {
      type: String,
    },
    material_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    unit_of_measure: {
      type: String,
      enum: ['kilograms', 'litres', 'units'],
      default: 'units',
    },
    current_stock: {
      type: Number,
      default: 0,
    },
    failedQcCount: {
      type: Number,
      default: 0,
    },
    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    sku_code: {
      type: String,
      required: true,
    },
    unit_price: {
      type: Number,
    },
    lower_threshold: {
      type: Number,
      default: 0,
    },
    upper_threshold: {
      type: Number,
      default: 0,
    },
    zoho_item_id: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save middleware
rawMaterialsSchema.pre('save', async function (next) {
  const rawMaterial = this;

  if (rawMaterial.isNew || rawMaterial.isModified()) {
    const changes = rawMaterial.toObject();
    delete changes._id; // Remove _id to avoid conflicts
    delete changes.__v; // Remove version key if present

    try {
      await RawMaterialOrderHistory.create({
        rawMaterial: rawMaterial._id,
        changes: changes,
      });
    } catch (error) {
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});

// Create RawMaterials model
const RawMaterials = mongoose.model('RawMaterials', rawMaterialsSchema);

module.exports = RawMaterials;
