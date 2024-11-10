const rawMaterialPO_controller = require('../controllers/rawMaterialPurchaseOrders.controller');
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
  app.post(
    '/api/v1/createNewPO',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.createRawMaterialPO
  );

  app.post(
    '/api/v1/createNewPOFromRTO',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.createRawMaterialPOFromRTOOrder
  );

  app.patch(
    '/api/v1/updateQcInfo/:po_id',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.updateQcInfo
  );
  
  app.patch(
    '/api/v1/updatePO/:po_id',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.updateRawMaterialPO
  );

  app.post(
    '/api/v1/generateBatchSticker/:po_id',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.generateBatchStickers
  );

  app.get(
    '/api/v1/getAllFulfilledPO',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.getAllFulfilledPO
  );

  app.get(
    '/api/v1/getAllPO',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.getAllPOs
  );

  app.get(
    '/api/v1/getPoById/:po_id',
    [authValidator.isUserAuthenticated],
    rawMaterialPO_controller.getPOById
  );
};
