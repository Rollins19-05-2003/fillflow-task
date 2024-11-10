const orderController = require('../controllers/order.controller');
const authValidator = require('../middlewares/auth.middleware');
module.exports = function (app) {
  app.post(
    '/api/v1/createOrder',
    [authValidator.isUserAuthenticated],
    orderController.createCustomOrder
  );

  app.post(
    '/api/v1/upload-amazon-csv',
    [authValidator.isUserAuthenticated],
    orderController.uploadAmazonCSV
  );

  app.post(
    '/api/v1/upload-easyEcomm-csv',
    [authValidator.isUserAuthenticated],
    orderController.uploadEasyEcomCSV
  );

  app.get(
    '/api/v1/getAllOrders',
    [authValidator.isUserAuthenticated],
    orderController.getAllOrders
  );

  app.get(
    '/api/v1/getAllCustomOrders',
    [authValidator.isUserAuthenticated],
    orderController.getAllCustomOrders
  )

  app.get(
    '/api/v1/getAllOpenOrders',
    [authValidator.isUserAuthenticated],
    orderController.getAllOpenOrders
  );

  app.get(
    '/api/v1/getOrderByOrderId/:id',
    [authValidator.isUserAuthenticated],
    orderController.getOrderByOrderId
  );
  app.get(
    '/api/v1/getOrderByOrAWBNumber/:id',
    [authValidator.isUserAuthenticated],
    orderController.getOrderByAWBNumber
  );

  app.patch(
    '/api/v1/fulfillOrderByOrderId/:orderId', 
    [authValidator.isUserAuthenticated],
    orderController.updateOrderByOrderId
  );

  app.patch(
    '/api/v1/editOrderByInternalId/',
    [authValidator.isUserAuthenticated],
    orderController.editOrderByOrderInternalId
  );

  app.patch(
    '/api/v1/deleteOrderById/',
    [authValidator.isUserAuthenticated],
    orderController.deleteOrderByOrderInternalId
  );
};
