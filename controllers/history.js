const {validationResult} = require('express-validator');
const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');

const handleError = require('./handleError');

exports.getHistories = async (req, res, next) => {
  // console.log("getHistories ---", req.user);

  try {
    const listCart = await Order.find({userId: req.user.userId});

    res.status(200).json({
      message: 'Get success histories!',
      products: listCart,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHistoriesAll = async (req, res, next) => {
  // console.log("getHistoriesAll ---", req.user);

  try {
    const clients = await User.countDocuments();
    const orders = await Order.countDocuments();

    const histories = await Order.find().sort({createdAt: -1});

    const total = histories.reduce((sum, item) => (sum += +item.total), 0);

    // console.log(total);

    res.status(200).json({
      message: 'Get success histories!',
      clients: clients,
      orders: orders,
      histories: histories,
      total: total,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  // console.log('Get detail history-----')
  const orderId = req.params.historyId;
  // console.log("getHistory ---", orderId);

  try {
    const order = await Order.findById(orderId);

    res.status(200).json({
      message: 'Get success history!',
      order: order,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
