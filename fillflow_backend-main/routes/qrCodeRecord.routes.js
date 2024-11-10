const qrCodeRecordsController = require("../controllers/qrCodeRecords.controller");
const authValidator = require("../middlewares/auth.middleware");

module.exports = function (app) {
    app.get(
        "/api/v1/getAllQRCodeRecords",
        [authValidator.isUserAuthenticated],
        qrCodeRecordsController.getAllQRCodeRecords
    );
    app.post(
        "/api/v1/updateQRCodeStatus",
        [authValidator.isUserAuthenticated], // Middleware for authentication (if needed)
        qrCodeRecordsController.updateQRCodeStatus
    );
    app.get(
        "/api/v1/streamQRCodeRecords",
      //  [authValidator.isUserAuthenticated],
        qrCodeRecordsController.streamQRCodeRecords
    );
    

};
