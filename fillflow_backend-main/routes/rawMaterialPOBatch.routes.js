const rawMaterialPOBatch_controller = require("../controllers/rawMaterialPOBatch.controller");
const authValidator = require("../middlewares/auth.middleware");

module.exports = function (app) {
  app.get(
    "/api/v1/getRawMaterialPoBatchById/:raw_material_id",
    [authValidator.isUserAuthenticated],
    rawMaterialPOBatch_controller.getPOBatchModelsByRawMaterialId
  );
  app.get(
    "/api/v1/getBatchInfoByRawMatertialId/:raw_material_id",
    [authValidator.isUserAuthenticated],
    rawMaterialPOBatch_controller.getPOBatchModelTransformedDataByRawMaterialId
  );
  app.get(
    "/api/v1/getBatchNumberByPoId/:po_id",
    [authValidator.isUserAuthenticated],
    rawMaterialPOBatch_controller.getPOBatchModelNumberByPOId
  );
};
