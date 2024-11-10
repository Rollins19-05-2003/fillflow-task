const Mapping = require('../models/productMapping.model.js');

// Controller to add a new product mapping
exports.addProductMapping = async (req, res) => {
    const { easycomSKU, easycomQuantity, imsMappings } = req.body;

    // Validate the request body
    if (!easycomSKU || !easycomQuantity || !Array.isArray(imsMappings) || imsMappings.length === 0) {
        return res.status(400).json({ error: 'All fields are required and imsMappings must be a non-empty array' });
    }

    try {
        // Check if the mapping already exists
        const existingMapping = await Mapping.findOne({ easycomSKU, easycomQuantity });

        if (existingMapping) {
            return res.status(400).json({ error: 'Mapping with this Easycom SKU and quantity already exists' });
        }

        // Create a new product mapping
        const newMapping = new Mapping({
            easycomSKU,
            easycomQuantity,
            imsMappings,
        });

        // Save the mapping to the database
        await newMapping.save();

        return res.status(201).json({
            success: true,
            message: 'Product mapping added successfully',
            data: newMapping,
        });
    } catch (error) {
        console.error('Error adding product mapping:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
