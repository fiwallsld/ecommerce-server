const router = require('express').Router();
const chat = require('../controllers/chat.js');
const checkRole = require('../middleware/checkRole');
const isAuth = require('../middleware/is-auth');

router.get('/getById', chat.getMessageByRoomId);

router.post('/createNewRoom', chat.createNewRoom);

router.put('/addMessage', chat.addMessage);

router.get(
  '/getAllRoom',
  isAuth,
  checkRole(['sub-admin', 'admin']),
  chat.getAllRoom,
);

module.exports = router;
