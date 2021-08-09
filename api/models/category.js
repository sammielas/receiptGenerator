const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  items: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
