const rtoOrderController = require('../controllers/rtoOrder.controller');
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
    app.get (
        '/api/v1/getAllRtoOrders',
        //[authValidator.isUserAuthenticated],
        rtoOrderController.getAllRtoOrders
    );
};

