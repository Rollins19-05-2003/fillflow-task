const categoryController = require('../controllers/category.controller');
const authValidator = require('../middlewares/auth.middleware');
module.exports = function (app) {
  app.post(
    '/api/v1/createCategory',
    [authValidator.isUserAuthenticated],
    categoryController.createCategory
  );
  app.get(
    '/api/v1/getAllCategories',
    [authValidator.isUserAuthenticated],
    categoryController.getAllCategories
  );
};
