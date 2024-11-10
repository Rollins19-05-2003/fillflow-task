const product_controller = require('../controllers/product.controller');
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
  app.post(
    '/api/v1/createNewProduct',
    [authValidator.isUserAuthenticated],
    product_controller.createProduct
  );
  app.get('/api/v1/getAllProducts', product_controller.getAllProducts);
  app.get(
    '/api/v1/getAllProductsByCatId/:catId',
    product_controller.getAllProductsByCatId
  );
  app.get('/api/v1/getProductsById/:id', product_controller.getProductById);

  app.post(
    '/api/v1/createProductPO',
    [authValidator.isUserAuthenticated],
    product_controller.isSufficientQuantityAvailable
  );
};
