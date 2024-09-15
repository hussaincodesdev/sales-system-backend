import { Request, Response } from "express";
import { validationResult } from "express-validator";
import asyncHandler from "../middleware/catchAsync";
import * as applicationModel from "../models/Application";
import * as userModel from "../models/User";
import { getUserIdFromToken } from "../utils/auth";
const { Parser } = require("json2csv");

export const getApplications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  const applications = await applicationModel.GetApplications(userId);
  if (!applications) return res.status(200).json([]);

  return res.status(200).json(applications);
};

export const GetAllApplications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  const applications = await applicationModel.GetAllApplications();
  if (!applications) return res.status(200).json([]);

  return res.status(200).json(applications);
};

export const getCoachApplications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  const applications = await applicationModel.GetCoachApplications(userId);
  if (!applications) return res.status(200).json([]);

  return res.status(200).json(applications);
};

export const createApplication = (
  req: Request,
  res: Response
): Promise<Response> => {
  return saveApplication(req, res, false);
};

export const updateApplication = (
  req: Request,
  res: Response
): Promise<Response> => {
  return saveApplication(req, res, true);
};

const saveApplication = async (
  req: Request,
  res: Response,
  isUpdate: boolean = false
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const salesAgent = await userModel.findSalesAgentByUserId(userId);
  if (!salesAgent) {
    return res.status(404).json({ message: "Sales agent not found" });
  }

  const application = req.body;
  application.sales_agent_id = salesAgent.id;

  if (isUpdate) {
    const applicationId = parseInt(req.params.id);
    if (!applicationId) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const update = await applicationModel.UpdateApplication(
      applicationId,
      application
    );
    if (!update)
      return res.status(500).json({ message: "Failed to update application" });
    return res.status(200).json({ update });
  } else {
    const applicationId = await applicationModel.CreateApplication(application);
    if (!applicationId)
      return res.status(500).json({ message: "Failed to create application" });
    return res.status(201).json({ applicationId });
  }
};

export const deleteApplication = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const applicationId = parseInt(req.params.id);
  if (!applicationId) {
    return res.status(400).json({ message: "Invalid application ID" });
  }

  const deleted = await applicationModel.DeleteApplication(applicationId);
  if (!deleted)
    return res.status(500).json({ message: "Failed to delete application" });
  return res.status(200).json({ deleted });
};

export const exportApplications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  const applications = await applicationModel.GetApplications(userId);

  try {
    const json2csvParser = new Parser();

    const csv =
      applications && applications.length > 0
        ? json2csvParser.parse(applications)
        : "";

    res.header("Content-Type", "text/csv");
    res.attachment(`application_export.csv`);
    return res.send(csv);
  } catch (err) {
    console.log("Error converting data to CSV format", err);
    return res
      .status(500)
      .json({ error: "Error converting data to CSV format" });
  }
};

export const exportCoachApplications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  try {
    const applications = await applicationModel.GetCoachApplicationsForExport(
      userId
    );

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    const json2csvParser = new Parser({
      fields: [
        "First Name",
        "Last Name",
        "Mobile",
        "CPR",
        "Submitted Date",
        "Completed",
        "Sales Agent Name",
      ],
    });

    const csvData = applications.map((app: any) => ({
      "First Name": app.first_name,
      "Last Name": app.last_name,
      Mobile: app.mobile,
      CPR: app.cpr,
      "Submitted Date": app.date_submitted,
      Completed: app.application_status === "completed" ? "Yes" : "No",
      "Sales Agent Name": `${app.agent_first_name} ${app.agent_last_name}`,
    }));

    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("coach_applications_export.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting coach applications to CSV:", err);
    return res
      .status(500)
      .json({ error: "Error exporting applications to CSV format" });
  }
};

export const exportAllApplications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const applications = await applicationModel.GetAllApplicationsForExport();

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    const json2csvParser = new Parser({
      fields: [
        "First Name",
        "Last Name",
        "Mobile",
        "CPR",
        "Submitted Date",
        "Completed",
        "Sales Agent Name",
        "Coach Name",
      ],
    });

    const csvData = applications.map((app: any) => ({
      "First Name": app.first_name,
      "Last Name": app.last_name,
      Mobile: app.mobile,
      CPR: app.cpr,
      "Submitted Date": app.date_submitted,
      Completed: app.application_status === "completed" ? "Yes" : "No",
      "Sales Agent Name": `${app.agent_first_name} ${app.agent_last_name}`,
      "Coach Name": `${app.coach_first_name} ${app.coach_last_name}`,
    }));

    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("all_applications_export.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting all applications to CSV:", err);
    return res
      .status(500)
      .json({ error: "Error exporting applications to CSV format" });
  }
};

export const markApplicationCompleted = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
      await applicationModel.completeApplication(applicationId);
      return res
        .status(200)
        .json({ message: "Application marked as completed successfully." });
    } catch (error) {
      console.error("Error marking application as completed:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const markApplicationIncomplete = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
      await applicationModel.incompleteApplication(applicationId);
      return res
        .status(200)
        .json({ message: "Application marked as incomplete successfully." });
    } catch (error) {
      console.error("Error marking application as incomplete:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
