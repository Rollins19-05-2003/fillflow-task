const ProductHistory = require('../models/productHistory.model');
const Product = require('../models/product.model');
const RawMaterialOrderHistory = require('../models/rawMaterialHistory.model');
const RawMaterial = require('../models/rawMaterial.model');

exports.inventoryRoomDayStartingCount = async (req, res) => {
  const { reportDate } = req.body;
  if (!reportDate) {
    return res.status(400).send({ error: 'Date query parameter is required' });
  }

  try {
    // Step 1: Fetch all ProductHistory documents created on or before the report date
    const productHistories = await ProductHistory.find({
      createdAt: { $lte: reportDate },
    })
      .sort({ createdAt: 1 }) // Sort by creation date to apply changes in the correct order
      .lean(); // Use lean for faster performance

    // Step 2: Group changes by productId
    const productChanges = productHistories.reduce((acc, history) => {
      if (!acc[history.product]) {
        acc[history.product] = [];
      }
      acc[history.product].push(history.changes);
      return acc;
    }, {});

    // Step 3: Fetch initial state of all relevant products
    const productIds = Object.keys(productChanges);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // Step 4: Apply changes to reconstruct products
    const reconstructedProducts = products.map((product) => {
      const changes = productChanges[product._id.toString()];
      if (changes) {
        changes.forEach((change) => {
          // Apply each change to the product
          Object.assign(product, change);
        });
      }
      return product;
    });

    // Step 5: Send the reconstructed products in the response
    res.status(200).send(reconstructedProducts);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};


exports.storageRoomDayStartingCount = async (req, res) => {
  const { reportDate } = req.body;
  if (!reportDate) {
    return res.status(400).send({ error: 'Date query parameter is required' });
  }

 
  try {
    // Step 1: Fetch all RawMaterialOrderHistory documents created on or before the report date
    const rawMaterialHistories = await RawMaterialOrderHistory.find({
      createdAt: { $lte: reportDate },
    })
      .sort({ createdAt: 1 }) // Sort by creation date to apply changes in the correct order
      .lean(); // Use lean for faster performance


    // Step 2: Group changes by raw material ID
    const rawMaterialChanges = rawMaterialHistories.reduce((acc, history) => {
      if (!acc[history.rawMaterial]) {
        acc[history.rawMaterial] = [];
      }
      acc[history.rawMaterial].push(history.changes);
      return acc;
    }, {});

    // Step 3: Fetch initial state of all relevant raw materials
    const rawMaterialIds = Object.keys(rawMaterialChanges);
    const rawMaterials = await RawMaterial.find({
      _id: { $in: rawMaterialIds },
    }).lean();

    // Step 4: Apply changes to reconstruct raw materials
    const reconstructedRawMaterials = rawMaterials.map((material) => {
      const changes = rawMaterialChanges[material._id.toString()];
      if (changes) {
        changes.forEach((change) => {
          // Apply each change to the raw material
          Object.assign(material, change);
        });
      }
      return material;
    });

    // Step 5: Send the reconstructed raw materials in the response
    res.status(200).send(reconstructedRawMaterials);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
