const reportsController = require('../controllers/reports.controller');
const authValidator = require('../middlewares/auth.middleware');

module.exports = function (app) {
  app.post(
    '/api/v1/inventory_room_day_starting_count',
    [authValidator.isUserAuthenticated],
    reportsController.inventoryRoomDayStartingCount
  );

  app.post(
    '/api/v1/storage_room_day_starting_count',
    [authValidator.isUserAuthenticated],
    reportsController.storageRoomDayStartingCount
  );
};
