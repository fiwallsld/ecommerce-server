const { validationResult } = require("express-validator");
const User = require("../models/user");
const Chat = require("../models/chat");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleError = require("./handleError");

exports.getAutoLogin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json({
      message: "Auto login success.",
      user: {
        fullname: user.fullname,
        userId: user._id,
        email: user.email,
        cart: user.cart,
        roomId: req.user.roomId,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json({
      message: "Get all users success.",
      users: users,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json({
      message: "Get user success.",
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putEditUser = async (req, res, next) => {
  const userId = req.params.id;
  // console.log("putEditUser", req.body);
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
        })
    );
    return res.status(422).json(errorData);
  }

  try {
    const user = await User.findByIdAndUpdate(userId, {
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
    });

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    await user.save();

    res.status(201).json({
      message: "Get user success.",
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  console.log("Delete user----", userId);

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("No exiting user!!!");
      error.httpStatusCode = 404;
      throw error;
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Delete user success.",
      user: user,
    });
  } catch (err) {
    // console.log(error);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getLogout = async (req, res, next) => {
  console.log("getLogout");
  res.status(201).json({
    message: "Logout success.",
  });
};

exports.postSignup = async (req, res, next) => {
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
        })
    );
    return res.status(422).json(errorData);
  }

  try {
    const passHash = await bcrypt.hash(req.query.password, 12);
    const chatRoom = new Chat({
      content: [
        {
          message: "Chào bạn, bạn muốn hỗ trợ sản phẩm nào vậy ạ.",
          is_admin: true,
        },
      ],
    });

    await chatRoom.save();

    const newUser = new User({
      email: req.query.email,
      fullname: req.query.fullname,
      phone: req.query.phone,
      password: passHash,
      role: "client",
      cart: [],
      roomId: chatRoom._id.toString(),
    });

    const user = await newUser.save();

    chatRoom.userId = newUser._id.toString();

    await chatRoom.save();

    res.status(201).json({
      message: "Signup success! Redirecting to login page.",
      user: {
        email: user.email,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    handleError.summaryError(error, next);
  }
};

exports.postLogin = (req, res, next) => {
  console.log("Login input =", req.query);

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
        })
    );
    return res.status(422).json(errorData);
  }

  const email = req.query.email;
  const password = req.query.password;
  let loaderUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // handleError.throwError(401, 'Auser')
        return res
          .status(401)
          .json({ status: 401, email: "Email is not exiting!!!" });
      }
      loaderUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        return res
          .status(422)
          .json({ status: 422, password: "Password is wrong!!!" });
      }

      const token = jwt.sign(
        {
          email: loaderUser.email,
          userId: loaderUser._id.toString(),
          role: loaderUser.role,
          roomId: loaderUser?.roomId,
        },
        "frankfullstack",
        {
          expiresIn: "4h",
        }
      );
      // console.log("Login success!");

      res.status(200).json({
        message: "Login success! Redirecting to homepage.",
        user: {
          userId: loaderUser._id,
          email: loaderUser.email,
          fullname: loaderUser.fullname,
          cart: loaderUser.cart,
          token: token,
          roomId: loaderUser?.roomId,
        },
      });
    })
    .catch((error) => handleError.summaryError(error, next));
};

exports.searchPosts = (req, res, next) => {
  const keyword = req.query.keyword;

  Post.find()
    .then((posts) => {
      const result = posts.filter((post) => post.content.includes(keyword));
      res.status(200).json(result);
    })
    .catch((error) => handleError.summaryError(error, next));
};
