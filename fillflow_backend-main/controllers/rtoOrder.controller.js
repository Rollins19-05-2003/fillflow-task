const RtoOrder = require('../models/rtoOrder.model');

exports.getAllRtoOrders = async (req, res) => {
  try {
    const rtoOrders = await RtoOrder.find();

    if (!rtoOrders || rtoOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No RTO orders found',
      });
    }

    return res.status(200).json({
      success: true,
      data: rtoOrders,
      message: 'RTO orders retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching RTO orders:', {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RTO orders',
      error: error.message,
    });
  }
};
