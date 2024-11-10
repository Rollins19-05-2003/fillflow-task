const orderDetailsController = require('../controllers/orderDetails.controller');
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
    app.get (
        '/api/v1/getOrderDetailsByReferenceCode/:referenceCode',
        //[authValidator.isUserAuthenticated],
        orderDetailsController.getOrderDetailsByReferenceCode
    );

    app.post(
        '/api/v1/saveOrderDetails',
        //[authValidator.isUserAuthenticated],
        orderDetailsController.saveOrderDetails
    );

    app.get (
        '/api/v1/getAllOrderDetails',
        //[authValidator.isUserAuthenticated],
        orderDetailsController.getAllOrderDetails
    );
    
};
