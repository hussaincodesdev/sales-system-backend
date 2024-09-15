import express, { Router } from "express";
import applicationRoutes from "./applicationRoutes";
import authRoutes from "./authRoutes";
import coachesRoutes from "./coachesRoutes";
import commissionRoutes from "./commissionsRoute";
import userRoutes from "./userRoutes";

const router: Router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/applications", applicationRoutes);
router.use("/coaches", coachesRoutes);
router.use("/commissions", commissionRoutes);

export default router;
