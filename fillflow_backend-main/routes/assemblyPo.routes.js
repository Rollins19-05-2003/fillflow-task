const assemblyPoController = require("../controllers/assemblyPO.controller");
const authValidator = require("../middlewares/auth.middleware");
module.exports = function (app) {
  app.post(
    "/api/v1/createAssemblyPO",
    [authValidator.isUserAuthenticated],
    assemblyPoController.createAssemblyPO
  );

  app.get(
    "/api/v1/getAllAssemblyPo",
    [authValidator.isUserAuthenticated],
    assemblyPoController.getAllAssemblyPo
  );

  app.patch(
    "/api/v1/updateAssemblyPo/:id",
    [authValidator.isUserAuthenticated],
    assemblyPoController.updateAssemblyPo
  );

  app.get(
    "/api/v1/getAssemblyPoById/:id",
    [authValidator.isUserAuthenticated],
    assemblyPoController.getAssemblyPoById
  );
};
