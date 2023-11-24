const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    require: true,
  },
  fullname: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  roomId: { type: Schema.Types.ObjectId, require: true, ref: "Chat" },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  role: {
    type: String,
    require: true,
  },
});

userSchema.methods.addToCart = function (product, count, isPut = false) {
  // console.log("data add", product.name, "---", count);

  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = count;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    const isGreat = this.cart.items[cartProductIndex].quantity < count;

    if (isPut) {
      if (isGreat) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      } else newQuantity = this.cart.items[cartProductIndex].quantity - 1;
    } else newQuantity = this.cart.items[cartProductIndex].quantity + count;

    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
