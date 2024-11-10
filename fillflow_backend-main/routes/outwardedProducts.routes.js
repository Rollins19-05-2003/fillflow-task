const outwardedProducts_controller = require('../controllers/outwardedProducts.controller');    
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
    app.get(
        '/api/v1/getAllOutwardedProducts',
        //[authValidator.isUserAuthenticated],
        outwardedProducts_controller.getAllOutwardedProducts
    );
};
