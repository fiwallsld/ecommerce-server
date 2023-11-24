const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, require: true, ref: "User" },
    products: [
      {
        type: Object,
        require: true,
      },
    ],
    email: {
      type: String,
      require: true,
    },
    fullname: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    total: {
      type: String,
      require: true,
    },
    delivery: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
