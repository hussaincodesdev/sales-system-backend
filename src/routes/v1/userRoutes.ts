import express, { Router } from "express";
import {
  createSalesAgent,
  deleteSalesAgent,
  deleteSalesCoach,
  exportSalesAgents,
  exportSalesCoaches,
  getDashboardData,
  getSalesAgents,
  getSalesCoaches,
  getUserInfo,
  getUserProfile,
  updateSalesAgent,
  updateSalesCoach,
  updateUserProfile,
} from "../../controllers/UserController";
import { verifyToken } from "../../middleware/auth";
import {
  updateUserProfileValidator,
  updateUserValidator,
} from "../../validators/userValidators";

const router: Router = express.Router();

router.get("/", verifyToken, getUserInfo);
router.get("/sales-coaches", verifyToken, getSalesCoaches);
router.get("/profile", verifyToken, getUserProfile);
router.post(
  "/profile",
  verifyToken,
  updateUserProfileValidator,
  updateUserProfile
);

router.put(
  "/sales-coach/:id",
  verifyToken,
  updateUserValidator,
  updateSalesCoach
);
router.delete("/sales-coach/:id", verifyToken, deleteSalesCoach);
router.get("/export-sales-coach", verifyToken, exportSalesCoaches);

router.post("/sales-agents", verifyToken, createSalesAgent);
router.get("/sales-agents", verifyToken, getSalesAgents);
router.put("/sales-agents/:id", verifyToken, updateSalesAgent);
router.delete("/sales-agents/:id", verifyToken, deleteSalesAgent);

router.get("/export-sales-agents", verifyToken, exportSalesAgents);

router.get("/dashboard", verifyToken, getDashboardData);

export default router;
