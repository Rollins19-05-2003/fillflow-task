const warehouseController = require("../controllers/warehouse.controller");

const authValidator = require("../middlewares/auth.middleware");

module.exports = function (app) {
  app.post(
    "/api/v1/createWarehouse",
    [authValidator.isUserAuthenticated],
    warehouseController.createWarehouse
  );
};
