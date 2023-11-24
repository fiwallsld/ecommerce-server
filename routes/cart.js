const router = require("express").Router();
const cartController = require("../controllers/cart");
const checkRole = require("../middleware/checkRole");
const isAuth = require("../middleware/is-auth");

router.get("", isAuth, checkRole(["client", "admin"]), cartController.getCart);
router.post(
  "/add",
  isAuth,
  checkRole(["client", "admin"]),
  cartController.postAddToCart
);
router.put(
  "/update",
  isAuth,
  checkRole(["client", "admin"]),
  cartController.putToCart
);
router.delete(
  "/delete",
  isAuth,
  checkRole(["client", "admin"]),
  cartController.deleteToCart
);

module.exports = router;
