import { Request, Response } from "express";
import { validationResult } from "express-validator";
import asyncHandler from "../middleware/catchAsync";
import * as commissionModel from "../models/Commissions";
import { getUserIdFromToken } from "../utils/auth";

export const getAllCommissions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const commissions = await commissionModel.GetAllCommissions();
  return res.status(200).json(commissions);
};

export const getCommissions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid token" });
  }

  const commissions = await commissionModel.GetCommissions(userId);
  return res.status(200).json(commissions);
};

export const createCommission = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const commission = req.body;
  const commissionId = await commissionModel.CreateCommission(commission);
  if (!commissionId)
    return res.status(500).json({ message: "Failed to create commission" });
  return res.status(201).json({ commissionId });
};

export const updateCommission = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const commissionId = parseInt(req.params.id);
  if (!commissionId) {
    return res.status(400).json({ message: "Invalid commission ID" });
  }

  const { sales_agent_id, amount, status } = req.body;
  const update = await commissionModel.UpdateCommission(commissionId, {
    sales_agent_id,
    amount,
    status,
  });
  if (!update)
    return res.status(500).json({ message: "Failed to update commission" });
  return res.status(200).json({ update });
};

export const deleteCommission = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const commissionId = parseInt(req.params.id);
  if (!commissionId) {
    return res.status(400).json({ message: "Invalid commission ID" });
  }

  const deleted = await commissionModel.DeleteCommission(commissionId);
  if (!deleted)
    return res.status(500).json({ message: "Failed to delete commission" });
  return res.status(200).json({ deleted });
};

export const markCommissionAsPaid = asyncHandler(
  async (req: Request, res: Response) => {
    const commissionId = parseInt(req.params.id);
    if (isNaN(commissionId)) {
      return res.status(400).json({ error: "Invalid commission ID" });
    }

    try {
      await commissionModel.markCommissionAsPaid(commissionId);
      return res
        .status(200)
        .json({ message: "Commission marked as paid successfully." });
    } catch (error) {
      console.error("Error marking commission as paid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const markCommissionAsDue = asyncHandler(
  async (req: Request, res: Response) => {
    const commissionId = parseInt(req.params.id);
    if (isNaN(commissionId)) {
      return res.status(400).json({ error: "Invalid commission ID" });
    }

    try {
      await commissionModel.markCommissionAsDue(commissionId);
      return res
        .status(200)
        .json({ message: "Commission marked as due successfully." });
    } catch (error) {
      console.error("Error marking commission as due:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
