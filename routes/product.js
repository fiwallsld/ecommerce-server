const router = require("express").Router();
const productController = require("../controllers/product");
const checkRole = require("../middleware/checkRole");
const isAuth = require("../middleware/is-auth");
const validator = require("express-validator").body;

router.get("", productController.getProducts);
router.get("/details/:id", productController.getProduct);
router.delete(
  "/delete/:id",
  isAuth,
  checkRole(["admin"]),
  productController.deleteProduct
);

router.put(
  "/edit/:id",
  [
    validator("name", "Please input valid product's name")
      .trim()
      .isLength({ min: 5 }),
    validator("category", "Please input valid category")
      .trim()
      .isLength({ min: 5 }),
    validator("short_desc", "Please input valid short description")
      .trim()
      .isLength({ min: 5 }),
    validator("long_desc", "Please input valid long description")
      .trim()
      .isLength({ min: 10 }),
  ],
  isAuth,
  checkRole(["admin"]),
  productController.putEditProduct
);

router.post(
  "/new",
  [
    validator("name", "Please input valid product's name")
      .trim()
      .isLength({ min: 3 }),
    validator("category", "Please input valid category")
      .trim()
      .isLength({ min: 3 }),
    validator("short_desc", "Please input valid short description")
      .trim()
      .isLength({ min: 5 }),
    validator("long_desc", "Please input valid long description")
      .trim()
      .isLength({ min: 10 }),
  ],
  isAuth,
  checkRole(["admin"]),
  productController.postNewProduct
);

router.get("/category", productController.getCategory);
router.get("/pagination", productController.getPagination);

module.exports = router;
