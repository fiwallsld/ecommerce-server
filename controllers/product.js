const {validationResult} = require('express-validator');
const User = require('../models/user');
const Product = require('../models/product');
const handleError = require('./handleError');
const fs = require('fs');
const path = require('path');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      message: 'Get products success.',
      products: products,
      totalProducts: products.length,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.getProduct = async (req, res, next) => {
  const prodId = req.params.id;

  // console.log("Get a product----", prodId);

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      const error = new Error('No exiting product!!!');
      error.httpStatusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Get product success.',
      product: product,
    });
  } catch (err) {
    // console.log(error);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.id;

  // console.log("Delete a product----", prodId);

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      const error = new Error('No exiting product!!!');
      error.httpStatusCode = 404;
      throw error;
    }

    await Product.findByIdAndDelete(prodId);

    for (let i = 1; i <= 5; i++) {
      if (product?.[`img${i}`]) clearImg(product?.[`img${i}`]);
    }

    res.status(200).json({
      message: 'Delete product success.',
      product: product,
    });
  } catch (err) {
    // console.log(error);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.putEditProduct = async (req, res, next) => {
  const prodId = req.params.id;
  // console.log("Edit a product----", prodId);

  const error = validationResult(req);

  if (!error.isEmpty()) {
    let errorData = {
      status: 422,
    };
    error.array().forEach(
      (item) =>
        (errorData = {
          ...errorData,
          [item.path]: item.msg,
        }),
    );
    return res.status(422).json(errorData);
  }

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      const error = new Error('No exiting product!!!');
      error.httpStatusCode = 404;
      throw error;
    }

    product.name = req.body.name;
    product.category = req.body.category;
    product.short_desc = req.body.short_desc;
    product.long_desc = req.body.long_desc;

    await product.save();
    res.status(201).json({
      message: 'Edit product success.',
      product: product,
    });
  } catch (err) {
    // console.log(error);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewProduct = async (req, res, next) => {
  // console.log("Post a new product----", req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    let errorData = {
      status: 422,
    };
    error.array().forEach(
      (item) =>
        (errorData = {
          ...errorData,
          [item.path]: item.msg,
        }),
    );
    return res.status(422).json(errorData);
  }

  if (!req.files) handleError.notFoundError('No images provided!!!');

  const files = req.files;

  let imgs = {};
  let i = 0;
  files.forEach((file) => {
    imgs[`img${++i}`] = file.path;
  });

  const product = new Product({
    name: req.body.name,
    category: req.body.category,
    short_desc: req.body.short_desc,
    long_desc: req.body.long_desc,
    ...imgs,
    price: '5000000',
    count: '5',
  });

  try {
    await product.save();

    res.status(200).json({
      message: 'Post a new product success.',
      product: product,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getPagination = async (req, res, next) => {
  const perPage = 6;
  const currentPage = req.query.page || 1;
  const key = req.query.search;
  const category = req.query.category;
  // console.log('getPagination', req.query);

  // let totalProducts;
  try {
    const allProducts = await Product.find();
    // const totalProducts = await Product.find().countDocuments();
    const totalProducts = allProducts.length;

    const products = await Product.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    let results = [...products];

    if (category !== 'all')
      results = allProducts.filter((prod) => prod.category == category);

    if (key !== '')
      results = allProducts.filter(
        (prod) =>
          prod.name.toLowerCase().includes(key.toLowerCase()) ||
          prod.long_desc.toLowerCase().includes(key.toLowerCase()),
      );

    res.status(200).json({
      message: 'Fetched products successfully.',
      products: results,
      totalProducts:
        category === 'all' && key === '' ? totalProducts : results.length,
    });
  } catch (error) {
    handleError.summaryError(error, next);
  }
};
exports.getCategory = (req, res, next) => {};

const clearImg = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log('Not exiting file!');
      return;
    }

    fs.unlink(filePath, (er) => {
      if (er) console.log(err);
    });
  });
};
