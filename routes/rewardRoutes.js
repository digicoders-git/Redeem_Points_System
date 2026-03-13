import express from "express";
import {
  addReward,
  getAllRewardsAdmin,
  updateReward,
  deleteReward,
  getAllRewardsUser,
  applyRedemption,
  getMyRedemptions,
  getAllRedemptions,
  getRedemptionDetail,
  approveRedemption,
  rejectRedemption,
} from "../controllers/rewardController.js";
import { userAuth } from "../middleware/userAuth.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// User routes
router.get("/user/all", userAuth, getAllRewardsUser);
router.post("/user/apply", userAuth, applyRedemption);
router.get("/user/my-redemptions", userAuth, getMyRedemptions);

// Admin routes - Rewards
router.post("/admin/add", authenticateAdmin, addReward);
router.get("/admin/rewards", authenticateAdmin, getAllRewardsAdmin);
router.put("/admin/rewards/:id", authenticateAdmin, updateReward);
router.delete("/admin/rewards/:id", authenticateAdmin, deleteReward);

// Admin routes - Redemptions
router.get("/admin/redemptions", authenticateAdmin, getAllRedemptions);
router.get("/admin/redemptions/:id", authenticateAdmin, getRedemptionDetail);
router.patch("/admin/redemptions/:id/approve", authenticateAdmin, approveRedemption);
router.patch("/admin/redemptions/:id/reject", authenticateAdmin, rejectRedemption);

export default router;
