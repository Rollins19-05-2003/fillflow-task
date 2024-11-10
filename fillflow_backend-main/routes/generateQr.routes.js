const generateQRCode_controller = require("../controllers/generateQr.controller");
const authValidator = require("../middlewares/auth.middleware");

module.exports = function (app) {
  app.post(
    "/api/v1/generateQr",
     [authValidator.isUserAuthenticated],
    generateQRCode_controller.generateQRCode
  );
};



// doc.pipe(fs.createWriteStream("QRfile.pdf"));