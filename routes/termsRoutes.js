import express from "express";
import { getTerms, getAllTermsAdmin, addTerm, updateTerm, deleteTerm } from "../controllers/termsController.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public
router.get("/", getTerms);

// Admin
router.get("/admin/all", authenticateAdmin, getAllTermsAdmin);
router.post("/admin/add", authenticateAdmin, addTerm);
router.put("/admin/:id", authenticateAdmin, updateTerm);
router.delete("/admin/:id", authenticateAdmin, deleteTerm);

export default router;
