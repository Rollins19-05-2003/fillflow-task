const mongoose = require('mongoose');

const recordsSchema = new mongoose.Schema(
    {
      grnNumbers: {
        type: [String],
        default: [],
      },
      batchNumbers: {
        type: [String],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

const Records = mongoose.model('Records', recordsSchema);

module.exports = Records;