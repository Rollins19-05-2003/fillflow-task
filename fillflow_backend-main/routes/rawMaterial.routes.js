const rawMaterialController = require("../controllers/rawMaterial.controller");
const authValidator = require("../middlewares/auth.middleware");

module.exports = function (app) {
  app.post(
    "/api/v1/creatRawMaterial",
    [authValidator.isUserAuthenticated],
    rawMaterialController.createRawMaterial
  );
  app.get(
    "/api/v1/getAllRawMaterials",
    [authValidator.isUserAuthenticated],
    rawMaterialController.getAllRawMaterials
  );
  app.get(
    "/api/v1/getRawMaterialByCatId/:categoryId",
    [authValidator.isUserAuthenticated],
    rawMaterialController.getAllRawMaterialsByCategoryId
  );

  app.post(
    "/api/v1/checkRawMaterialQuantity",
    [authValidator.isUserAuthenticated],
    rawMaterialController.checkRawMaterialQuantity
  );

  app.get(
    "/api/v1/getSkuCodeById/:id",
    [authValidator.isUserAuthenticated],
    rawMaterialController.getSkuCodeById
  );

};
