const picklistController = require('../controllers/pickList.controller');
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
  app.post(
    '/api/v1/create_picklist',
    [authValidator.isUserAuthenticated],
    picklistController.createPickList
  );

  app.get(
    '/api/v1/getAllpicklist',
    [authValidator.isUserAuthenticated],
    picklistController.getAllPickLists
  );

  app.get(
    '/api/v1/getPicklistById/:id',
    [authValidator.isUserAuthenticated],
    picklistController.getPickListById
  );
  app.patch(
    '/api/v1/updatePicklistById/:id',
    [authValidator.isUserAuthenticated],
    picklistController.updatePickListStatus
  );
};
