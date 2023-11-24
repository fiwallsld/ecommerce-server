const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  category: {
    type: String,
    require: true,
  },
  long_desc: {
    type: String,
    require: true,
  },
  short_desc: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  price: {
    type: String,
    require: true,
  },
  count: {
    type: String,
    require: true,
  },
  img1: {
    type: String,
    require: true,
  },
  img2: {
    type: String,
    require: true,
  },
  img3: {
    type: String,
    require: true,
  },
  img4: {
    type: String,
    require: true,
  },
  img5: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
