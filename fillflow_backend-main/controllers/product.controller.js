const Product = require('../models/product.model');
const AssemblyPO = require('../models/assemblyPO.model');
const RawMaterial = require('../models/rawMaterial.model');

exports.createProduct = async (req, res) => {
  const data = req.body;
  try {
    const newProduct = new Product ({
      product_name: data.product_name,
      product_description: data.product_description,
      product_category_id: data.product_category_id,
      unit_of_measure: data.unit_of_measure,
      current_stock: data.current_stock,
      current_count: data.current_count,
      lower_threshold: data.lower_threshold,
      upper_threshold: data.upper_threshold,
      warehouse_id: data.warehouse_id,
      sku_code: data.sku_code,
      amazon_sku_code: data.amazon_sku_code,
      shopify_sku_code: data.shopify_sku_code,
      items: data.items.map((item) => ({
        item: item.rawmaterial_id,
        quantity: item.quantity,
      })),
    });
    await newProduct.save();
    if (!newProduct) {
      return res.status(404).json({
        success: false,
        message: 'Category is not created.',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'SuccessFully created the Product',
      data: newProduct,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products from the database
    const allProducts = await Product.find().populate('product_category_id');

    if (!allProducts) {
      return res.status(404).json({
        success: false,
        message: 'Product is not fetched.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched all products',
      data: allProducts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getAllProductsByCatId = async (req, res) => {
  try {
    // Fetch all products from the database
    const allProducts = await Product.find({
      product_category_id: req.params.catId,
    });

    if (!allProducts) {
      return res.status(404).json({
        success: false,
        message: 'Product is not fetched.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched all products by categoryId',
      data: allProducts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// for raising fg assembly po
exports.isSufficientQuantityAvailable = async (req, res) => {
  try {
    const data = req.body;
    const productDetail = await Product.findById(data.product_id);
    if (!productDetail) {
      return res.status(404).json({
        success: false,
        message: 'Product is not found',
      });
    }

    // Empty array to store messages
    const messages = [];
    const newItems = [];
    // Array to store AssemblyPO data for creation
    const currentUserInfo = req.user;
    // Using for...of loop to handle async operations
    for (const item of productDetail.items) {
      const rawMaterialDetail = await RawMaterial.findById(item.item);
      if (!rawMaterialDetail) {
        messages.push({
          success: false,
          message: 'Raw material not found.',
        });
        continue; // Continue to next iteration
      }

      const totalRequiredQuantity = data.quantity * item.quantity;

      if (rawMaterialDetail.current_stock >= totalRequiredQuantity) {
        // Create AssemblyPO
        newItems.push({
          item: rawMaterialDetail._id,
          quantity: totalRequiredQuantity,
        });

        // Subtract item.quantity from rawMaterial.current_stock
        // Save updated rawMaterial
      } else {
        messages.push({
          success: false,
          status: 404,
          message: `PO can't be raised only ${rawMaterialDetail.current_stock} ${rawMaterialDetail.unit_of_measure} of ${rawMaterialDetail.material_name} is left `,
        });
      }
    }

    // Check if all items have sufficient quantity
    if (messages.length === 0) {
      for (const item of newItems) {
        const newAssemblyPO = await AssemblyPO.create({
          raw_material_id: item.item,
          quantity: item.quantity,
          createdBy: currentUserInfo?.data?._id,
        });

        if (!newAssemblyPO) {
          return res.status(404).json({
            success: false,
            message: 'newAssemblyPO is not created',
          });
        } else {
          const rawMaterial = await RawMaterial.findByIdAndUpdate(item.item);
          if (!rawMaterial) {
            return res.status(404).json({
              success: false,
              message: 'Raw material not found.',
            });
          }
          // else {
          //   rawMaterial.current_stock =
          //     rawMaterial.current_stock - item.quantity;
          //   await rawMaterial.save();
          // }
        }
      }

      // If no messages, send success response
      return res.json({
        success: true,
        message: 'All items processed successfully',
      });
    } else {
      // Sending response with messages
      return res.json({
        messages: messages,
        success: false,
      }); // Sending array of messages
    }
  } catch (err) {
    console.log('er from midle===', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    // Fetch all products from the database
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product is not fetched.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched product Id',
      data: product,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
