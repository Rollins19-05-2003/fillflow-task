const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5001;
const cors = require("cors");

// importing routes
const warehouseRoutes = require("./routes/warehouse.routes");
const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const categoryRoutes = require("./routes/category.routes");
const rawMaterialRoutes = require("./routes/rawMaterial.routes");
const rawMaterialPORoutes = require("./routes/rawMaterial_PO.routes");
const rawMaterialPOBatchRoutes = require("./routes/rawMaterialPOBatch.routes");
const productRoutes = require("./routes/product.routes");
const assemblyPORoutes = require("./routes/assemblyPo.routes");
const generateQrRoutes = require("./routes/generateQr.routes");
const inventoryPORoutes = require("./routes/inventoryPo.routes");
const orderRoutes = require("./routes/order.routes");
const pickListRoutes = require("./routes/pickList.routes");
const reportRoutes = require("./routes/reports.routes");
const recordRoutes = require("./routes/records.routes");
const qrCodeRecordsRoutes = require("./routes/qrCodeRecord.routes");
const bulkRawMaterialPORoutes = require("./routes/bulkRawMaterialPO.routes");
const orderDetailsRoutes = require('./routes/orderDetails.routes');
const rtoOrderRoutes = require('./routes/rtoOrder.routes');
const productMappingRoutes = require('./routes/productMapping.routes');
const outwardedProductsRoutes = require('./routes/outwardedProducts.routes');

app.use(bodyParser.json());
app.use(cors());

// calling routes here
warehouseRoutes(app);
authRoutes(app);
vendorRoutes(app);
categoryRoutes(app);
rawMaterialRoutes(app);
rawMaterialPORoutes(app);
rawMaterialPOBatchRoutes(app);
productRoutes(app);
assemblyPORoutes(app);
generateQrRoutes(app);
inventoryPORoutes(app);
orderRoutes(app);
pickListRoutes(app);
reportRoutes(app);
recordRoutes(app);
qrCodeRecordsRoutes(app);
bulkRawMaterialPORoutes(app);
orderDetailsRoutes(app);
rtoOrderRoutes(app);
productMappingRoutes(app);
outwardedProductsRoutes(app);

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect(process.env.MONGO_URL).then(
    () => {
      console.log("Mongodb connected...");
      // cronJob.start();
    },

    (err) => {
      console.log("Error occurred:", err);
    }
  );
});
