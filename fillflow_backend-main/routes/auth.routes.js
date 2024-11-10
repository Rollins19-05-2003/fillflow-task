const authController = require("../controllers/auth.controller");

module.exports = function (app) {
  app.post("/api/v1/signup", authController.createUser);
  app.post("/api/v1/signin", authController.signin);
};
