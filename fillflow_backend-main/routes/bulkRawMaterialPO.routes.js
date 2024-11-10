const bulkRawMaterialPOController = require("../controllers/bulkRawMaterialPO.controller");
const authValidator = require("../middlewares/auth.middleware");
module.exports = function (app) {
  app.post(
    "/api/v1/createbulkRawMaterialPO",
    [authValidator.isUserAuthenticated],
    bulkRawMaterialPOController.createbulkRawMaterialPO
  );
  app.get(
    "/api/v1/getAllbulkRawMaterialPO",
    [authValidator.isUserAuthenticated],
    bulkRawMaterialPOController.getAllbulkRawMaterialPO
  );
  app.patch(
    "/api/v1/updatebulkRawMaterialPO/:id",
    [authValidator.isUserAuthenticated],
    bulkRawMaterialPOController.updatebulkRawMaterialPO
  );

};