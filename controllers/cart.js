const { validationResult } = require("express-validator");
const User = require("../models/user");
const Product = require("../models/product");

const handleError = require("./handleError");

exports.getCart = async (req, res, next) => {
  // console.log("Get cart ---", req.user);
  try {
    const user = await User.findById(req.user.userId);

    user
      .populate("cart.items.productId")
      // .execPopulate()
      .then((user) => {
        const products = user.cart.items;

        res.status(200).json({
          message: "Get cart success!",
          products: products,
        });
      });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddToCart = async (req, res, next) => {
  const productId = req.query.idProduct;
  const count = req.query.count;
  const userId = req.user.userId;

  try {
    const product = await Product.findById(productId);
    const user = await User.findById(userId);

    await user.addToCart(product, parseInt(count));

    res.status(200).json({
      message: "Add product success",
      cart: user.cart,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.putToCart = async (req, res, next) => {
  const isPut = true;
  const productId = req.query.idProduct;
  const count = req.query.count;
  const userId = req.user.userId;

  try {
    const product = await Product.findById(productId);
    const user = await User.findById(userId);

    await user.addToCart(product, parseInt(count), isPut);

    res.status(200).json({
      message: "Put product success",
      cart: user.cart,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteToCart = async (req, res, next) => {
  // console.log("Delete product from cart");
  const productId = req.query.idProduct;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    await user.removeFromCart(productId);
    res.status(200).json({
      message: "Delete product success",
      cart: user.cart,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
