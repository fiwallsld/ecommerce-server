const {validationResult} = require('express-validator');
const User = require('../models/user');
const Chat = require('../models/chat');

const handleError = require('./handleError');

const socket = require('../socket');

exports.getMessageByRoomId = async (req, res, next) => {
  // console.log("Get mes by room ---", req.query.roomId);
  const roomId = req.query.roomId;

  if (!roomId) {
    const error = new Error("Didn't have room chat id!!");
    error.httpStatusCode = 404;
    next(error);
  }

  try {
    let chat = await Chat.findById(roomId);

    res.status(200).json({
      message: 'Get cart success!',
      content: chat.content,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getAllRoom = async (req, res, next) => {
  try {
    const chatRooms = await Chat.find().sort({createdAt: -1});

    res.status(200).json({
      message: 'Get cart success!',
      allRoom: chatRooms,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.createNewRoom = async (req, res, next) => {
  const chat = new Chat({
    userId: null,
    fullname: 'NoName',
    content: [
      {
        message: 'Chào bạn, bạn muốn hỗ trợ sản phẩm nào vậy ạ.',
        is_admin: true,
      },
    ],
  });

  try {
    await chat.save();

    res.status(200).json({
      message: 'Create new room success',
      roomId: chat._id.toString(),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.addMessage = async (req, res, next) => {
  const data = req.body;
  // console.log("Put addMessage", data);
  try {
    const chat = await Chat.findById(data.roomId);

    if (data.message === '/delete' && data.is_admin.toString() === 'true') {
      await Chat.findByIdAndDelete(data.roomId);

      return res.status(203).json({
        status: 203,
        message: 'Delete room chat success',
      });
    }

    chat.content.push({
      message: data.message,
      is_admin: data.is_admin,
    });

    await chat.save();

    socket.getIO().emit('receive_message', data);

    res.status(200).json({
      message: 'add message success',
      content: chat.content,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
