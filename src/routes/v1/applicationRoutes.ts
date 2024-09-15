import express, { Router } from "express";
import {
  createApplication,
  deleteApplication,
  exportAllApplications,
  exportApplications,
  exportCoachApplications,
  GetAllApplications,
  getApplications,
  getCoachApplications,
  markApplicationCompleted,
  markApplicationIncomplete,
  updateApplication,
} from "../../controllers/ApplicationController";
import { verifyToken } from "../../middleware/auth";
import { createApplicationValidator } from "../../validators/applicationValidators";

const router: Router = express.Router();

router.get("/", verifyToken, getApplications);
router.post(
  "/create",
  verifyToken,
  createApplicationValidator,
  createApplication
);
router.post(
  "/update/:id",
  verifyToken,
  createApplicationValidator,
  updateApplication
);
router.delete("/delete/:id", verifyToken, deleteApplication);

router.get("/export", verifyToken, exportApplications);

router.get("/coach/export", verifyToken, exportCoachApplications);

router.get("/admin/export", verifyToken, exportAllApplications);

router.get("/admin/get", verifyToken, GetAllApplications);

router.get("/coach/get", verifyToken, getCoachApplications);

router.post("/complete/:id", markApplicationCompleted);

router.post("/incomplete/:id", markApplicationIncomplete);

export default router;
