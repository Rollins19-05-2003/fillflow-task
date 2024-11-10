const inventoryPoController = require("../controllers/inventoryPO.controller");
const authValidator = require("../middlewares/auth.middleware");
module.exports = function (app) {
  app.post(
    "/api/v1/createInventoryPO",
    [authValidator.isUserAuthenticated],
    inventoryPoController.createInventoryPO
  );

  app.get(
    "/api/v1/getAllInventoryPo",
    [authValidator.isUserAuthenticated],
    inventoryPoController.getAllInventoryPo
  );

  app.get(
    "/api/v1/getInventoryPoById/:poId",
    [authValidator.isUserAuthenticated],
    inventoryPoController.getInventoryPoById
  );

  app.patch(
    "/api/v1/updateInventoryPo/:id",
    [authValidator.isUserAuthenticated],
    inventoryPoController.updateInventoryPo
  );
};
