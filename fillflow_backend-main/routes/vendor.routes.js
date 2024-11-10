const vendorController = require("../controllers/vendor.controller");
const authValidator = require("../middlewares/auth.middleware");

module.exports = function (app) {
  app.post(
    "/api/v1/createVendor",
    [authValidator.isUserAuthenticated],
    vendorController.createVendor
  );

  app.get(
    "/api/v1/getAllVendors",
    [authValidator.isUserAuthenticated],
    vendorController.getAllVendors
  );
};
