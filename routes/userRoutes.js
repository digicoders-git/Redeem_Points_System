import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  logoutUser,
  getAllUsers,
  getSingleUser,
  toggleUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { userAuth } from "../middleware/userAuth.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", userAuth, getProfile);
router.put("/profile", userAuth, updateProfile);
router.post("/logout", userAuth, logoutUser);

// Admin routes
router.get("/admin/all", authenticateAdmin, getAllUsers);
router.get("/admin/:id", authenticateAdmin, getSingleUser);
router.patch("/admin/:id/status", authenticateAdmin, toggleUserStatus);
router.patch("/admin/:id/change-password", authenticateAdmin, changeUserPassword);
router.delete("/admin/:id", authenticateAdmin, deleteUser);

export default router;
