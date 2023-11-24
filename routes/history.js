const router = require("express").Router();
const historyController = require("../controllers/history");
const checkRole = require("../middleware/checkRole");
const isAuth = require("../middleware/is-auth");

router.get(
  "/",
  isAuth,
  checkRole(["client", "admin"]),
  historyController.getHistories
);
router.get(
  "/details/:historyId",
  isAuth,
  checkRole(["client", "admin"]),
  historyController.getHistory
);
router.get(
  "/all",
  isAuth,
  checkRole(["client", "admin"]),
  historyController.getHistoriesAll
);

module.exports = router;
