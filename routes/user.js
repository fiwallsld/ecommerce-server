const router = require('express').Router();

const validQuery = require('express-validator').query;

const User = require('../models/user');
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const checkRole = require('../middleware/checkRole');

router.get('', isAuth, userController.getAutoLogin);

router.get('/all', isAuth, checkRole(['admin']), userController.getAllUsers);

router.get(
  '/detail/:id',
  isAuth,
  [
    validQuery('fullname', 'Please put valid full name!!!')
      .trim()
      .isLength({min: 5}),
    validQuery('email', 'Please put valid email!!')
      .isEmail()
      .custom((value, {req}) => {
        return User.findOne({email: value}).then((userDoc) => {
          if (userDoc) return Promise.reject('Email address already exists!');
        });
      })
      .normalizeEmail(),
    validQuery('role', 'Please choose a role for this account!!')
      .trim()
      .isLength({min: 6}),
    validQuery('phone', 'Please put valid phone number!!!')
      .trim()
      .isMobilePhone(),
  ],
  checkRole(['admin']),
  userController.getUser,
);

router.put(
  '/edit/:id',
  isAuth,
  checkRole(['admin']),
  userController.putEditUser,
);
router.delete(
  '/delete/:id',
  isAuth,
  checkRole(['admin']),
  userController.deleteUser,
);

router.get('/logout', isAuth, userController.getLogout);

router.post(
  '/signup',
  [
    validQuery('fullname', 'Please put valid full name!!!')
      .trim()
      .isLength({min: 5}),
    validQuery('email', 'Please put valid email!!')
      .isEmail()
      .custom((value, {req}) => {
        return User.findOne({email: value}).then((userDoc) => {
          if (userDoc) return Promise.reject('Email address already exists!');
        });
      })
      .normalizeEmail(),
    validQuery('password', 'Please put valid password! Least 6 character')
      .trim()
      .isLength({min: 6}),
    validQuery('phone', 'Please put valid phone number!!!')
      .trim()
      .isMobilePhone(),
  ],
  userController.postSignup,
);

router.post(
  '/login',
  [
    validQuery('email', 'Please put valid email!!').trim().isEmail(),
    validQuery('password', 'Please put valid password! Least 6 character')
      .trim()
      .isLength({min: 6}),
  ],
  userController.postLogin,
);

module.exports = router;
