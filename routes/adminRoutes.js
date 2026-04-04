import express from "express";
import { createAdmin, loginAdmin, listAdmins, logoutAll, changeAdminPassword } from "../controllers/adminController.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);

// protected routes
router.get("/list", authenticateAdmin, listAdmins);
router.post("/logout-all", authenticateAdmin, logoutAll);
router.patch("/change-password", authenticateAdmin, changeAdminPassword);

export default router;
