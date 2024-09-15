import express, { Router } from "express";
import {
  createCommission,
  deleteCommission,
  getAllCommissions,
  getCommissions,
  markCommissionAsDue,
  markCommissionAsPaid,
  updateCommission,
} from "../../controllers/CommissionsController";
import { verifyToken } from "../../middleware/auth";
import {
  createCommissionValidator,
  updateCommissionValidator,
} from "../../validators/commissionsValidators";

const router: Router = express.Router();

router.get("/", verifyToken, getCommissions);
router.post(
  "/create",
  verifyToken,
  createCommissionValidator,
  createCommission
);
router.put(
  "/update/:id",
  verifyToken,
  updateCommissionValidator,
  updateCommission
);
router.delete("/delete/:id", verifyToken, deleteCommission);

router.get("/all", verifyToken, getAllCommissions);

router.put("/mark-paid/:id", verifyToken, markCommissionAsPaid);
router.put("/mark-due/:id", verifyToken, markCommissionAsDue);

export default router;
