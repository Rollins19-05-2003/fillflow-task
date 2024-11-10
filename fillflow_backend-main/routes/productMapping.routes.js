const productMappingController = require('../controllers/productMapping.controller');

module.exports = function (app) {
    app.post(
        '/api/v1/addProductMapping',
        productMappingController.addProductMapping
    );
};