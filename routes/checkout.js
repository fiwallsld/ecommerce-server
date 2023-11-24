const router = require("express").Router();
const validQuery = require("express-validator").query;

const checkoutController = require("../controllers/checkout");
const checkRole = require("../middleware/checkRole");
const isAuth = require("../middleware/is-auth");

router.post(
  "",
  [
    validQuery("fullname", "Please put valid full name!!!")
      .trim()
      .isLength({ min: 5 }),
    validQuery("email", "Please put valid email!!").isEmail().normalizeEmail(),
    validQuery("phone", "Please put valid phone number!!!")
      .trim()
      .isLength({ min: 8 })
      .isMobilePhone(),
    validQuery("address", "Please put valid address!")
      .trim()
      .isLength({ min: 6 }),
  ],
  isAuth,
  checkRole(["client"], "admin"),
  checkoutController.postOrder
);

module.exports = router;
