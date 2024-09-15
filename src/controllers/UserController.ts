import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/catchAsync";
import * as applicationModel from "../models/Application";
import * as bankModel from "../models/Bank";
import * as salesAgentModel from "../models/SalesAgent";
import * as userModel from "../models/User";
import { User } from "../types/user";

const { Parser } = require("json2csv");

type NewUser = Omit<User, "id" | "is_deleted" | "created_at" | "updated_at">;

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await userModel.findUserByEmail(email);

  if (!user) {
    return res.status(400).json({
      token: null,
      message: {
        title: "Login Failed",
        description: "Invalid email or password.",
      },
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      token: null,
      message: {
        title: "Login Failed",
        description: "Invalid email or password.",
      },
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    token,
    message: {
      title: "Login Successful",
      description: "You have successfully logged in.",
    },
  });
});

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, mobile, password, role } = req.body;
    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: NewUser = {
      first_name,
      last_name,
      email,
      mobile,
      password: hashedPassword,
      role,
      is_active: true,
    };

    const userId = await userModel.CreateUser(newUser);
    if (userId) {
      res.status(201).json({ userId });
    } else {
      res.status(500).json({ message: "Failed to register user" });
    }
  }
);

export const getUserInfo = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
  const userId = decoded.id;

  const user = await userModel.findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { password, ...userInfo } = user;
  res.status(200).json(userInfo);
});

export const getSalesCoaches = asyncHandler(
  async (req: Request, res: Response) => {
    const salesCoaches = await userModel.GetAllSalesCoaches();
    if (!salesCoaches) return [];

    const coaches = salesCoaches.map(({ password, ...coach }) => coach);
    res.status(200).json(coaches);
  }
);

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;
    const userId = decoded.id;

    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userInfo } = user;

    const salesAgent = await userModel.findSalesAgentByUserId(userId);
    if (!salesAgent) {
      return res.status(404).json({ message: "Sales agent not found" });
    }

    if (!salesAgent.bank_details_id) {
      return res.status(200).json(userInfo);
    }

    const bankDetails = await bankModel.GetBankDetails(
      salesAgent.bank_details_id
    );
    if (!bankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    const profile = { ...userInfo, bank_details: bankDetails };
    res.status(200).json(profile);
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;
    const userId = decoded.id;

    const { first_name, last_name, email, mobile, bank_details } = req.body;

    const updatedUser = await userModel.UpdateUser(userId, {
      first_name,
      last_name,
      email,
      mobile,
    });
    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Failed to update user information" });
    }

    const salesAgent = await userModel.findSalesAgentByUserId(userId);
    if (!salesAgent) {
      return res.status(404).json({ message: "Sales agent not found" });
    }

    if (bank_details) {
      if (salesAgent.bank_details_id) {
        const updatedBankDetails = await bankModel.UpdateBankDetails(
          salesAgent.bank_details_id,
          bank_details
        );
        if (!updatedBankDetails) {
          return res
            .status(500)
            .json({ message: "Failed to update bank details" });
        }
      } else {
        const newBankDetailsId = await bankModel.CreateBankDetails({
          ...bank_details,
        });
        if (!newBankDetailsId) {
          return res
            .status(500)
            .json({ message: "Failed to create bank details" });
        }

        const updatedSalesAgent =
          await salesAgentModel.updateSalesAgentBankDetailsId(
            userId,
            newBankDetailsId
          );
        if (!updatedSalesAgent) {
          return res.status(500).json({
            message: "Failed to update sales agent with new bank details ID",
          });
        }
      }
    }

    res.status(200).json({ updated: true });
  }
);

export const updateSalesCoach = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salesCoachId = parseInt(req.params.id);
    if (!salesCoachId) {
      return res.status(400).json({ message: "Invalid sales coach ID" });
    }

    const { first_name, last_name, email, mobile, is_active, password } =
      req.body;

    const updateData: any = { first_name, last_name, email, mobile, is_active };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedSalesCoach = await userModel.UpdateUser(
      salesCoachId,
      updateData
    );
    if (!updatedSalesCoach) {
      return res
        .status(500)
        .json({ message: "Failed to update sales coach information" });
    }

    res.status(200).json({ updated: true });
  }
);

export const deleteSalesCoach = asyncHandler(
  async (req: Request, res: Response) => {
    const salesCoachId = parseInt(req.params.id);
    if (!salesCoachId) {
      return res.status(400).json({ message: "Invalid sales coach ID" });
    }

    const deleted = await userModel.DeleteUser(salesCoachId);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete sales coach" });
    }

    res.status(200).json({ deleted: true });
  }
);

export const exportSalesCoaches = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const salesCoaches = await userModel.GetAllSalesCoaches();

  const coaches = salesCoaches
    ? salesCoaches.map(({ password, ...coach }) => coach)
    : [];

  try {
    const json2csvParser = new Parser();

    const csv =
      coaches && coaches.length > 0 ? json2csvParser.parse(coaches) : "";

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

export const exportSalesAgents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const salesAgents = await userModel.GetAllSalesAgents();

    if (!salesAgents || salesAgents.length === 0) {
      return res.status(404).json({ message: "No sales agents found" });
    }

    const json2csvParser = new Parser({
      fields: ["First Name", "Last Name", "Email", "Mobile", "Active"],
    });

    const csvData = salesAgents.map((agent: User) => ({
      "First Name": agent.first_name,
      "Last Name": agent.last_name,
      Email: agent.email,
      Mobile: agent.mobile,
      Active: agent.is_active ? "Yes" : "No",
    }));

    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("sales_agents_export.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting sales agents to CSV:", err);
    return res
      .status(500)
      .json({ error: "Error exporting sales agents to CSV format" });
  }
};

export const createSalesAgent = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, mobile, password, coach_id } =
      req.body;

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: NewUser = {
      first_name,
      last_name,
      email,
      mobile,
      password: hashedPassword,
      role: "sales_agent",
      is_active: true,
    };

    const userId = await userModel.CreateUser(newUser);
    if (!userId) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    const salesAgent = await salesAgentModel.CreateSalesAgent({
      user_id: userId,
      coach_id,
    });
    if (!salesAgent) {
      return res.status(500).json({ message: "Failed to create sales agent" });
    }

    res.status(201).json({ message: "Sales agent created successfully" });
  }
);

export const exportAllSalesAgents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const salesAgents = await userModel.GetAllSalesAgentsWithCoach();

    if (!salesAgents || salesAgents.length === 0) {
      return res.status(404).json({ message: "No sales agents found" });
    }

    const json2csvParser = new Parser({
      fields: [
        "First Name",
        "Last Name",
        "Email",
        "Mobile",
        "Active",
        "Coach Name",
      ],
    });

    const csvData = salesAgents.map((agent: any) => ({
      "First Name": agent.first_name,
      "Last Name": agent.last_name,
      Email: agent.email,
      Mobile: agent.mobile,
      Active: agent.is_active ? "Yes" : "No",
      "Coach Name":
        agent.coach_first_name && agent.coach_last_name
          ? `${agent.coach_first_name} ${agent.coach_last_name}`
          : "No Coach Assigned",
    }));

    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("sales_agents_export.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error exporting sales agents to CSV:", err);
    return res
      .status(500)
      .json({ error: "Error exporting sales agents to CSV format" });
  }
};

export const getSalesAgents = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const salesAgents = await salesAgentModel.getAllSalesAgents();
      res.status(200).json(salesAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales agents" });
    }
  }
);

export const getCoachAgents = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as jwt.JwtPayload;
      const coachId = decoded.id;

      const salesAgents = await salesAgentModel.getCoachSalesAgents(coachId);
      res.status(200).json(salesAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales agents" });
    }
  }
);

export const updateSalesAgent = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salesAgentId = parseInt(req.params.id);
    if (!salesAgentId) {
      return res.status(400).json({ message: "Invalid sales agent ID" });
    }

    const user_id = await salesAgentModel.findUserIdBySalesAgentId(
      salesAgentId
    );
    if (!user_id) {
      return res.status(404).json({ message: "User not found" });
    }

    const { first_name, last_name, email, mobile, coach_id } = req.body;

    if (coach_id) {
      const updatedSalesAgent = await salesAgentModel.updateSalesAgentDetails(
        salesAgentId,
        coach_id
      );
      if (!updatedSalesAgent) {
        return res
          .status(500)
          .json({ message: "Failed to update sales agent information" });
      }
    }

    const updatedUser = await userModel.UpdateUser(user_id, {
      first_name,
      last_name,
      email,
      mobile,
    });
    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Failed to update user information" });
    }

    res.status(200).json({ message: "Sales agent updated successfully" });
  }
);

export const deleteSalesAgent = asyncHandler(
  async (req: Request, res: Response) => {
    const salesAgentId = parseInt(req.params.id);
    if (!salesAgentId) {
      return res.status(400).json({ message: "Invalid sales agent ID" });
    }

    const user_id = await salesAgentModel.findUserIdBySalesAgentId(
      salesAgentId
    );
    if (!user_id) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletedSalesAgent = await salesAgentModel.SoftDeleteSalesAgent(
      salesAgentId
    );
    const deletedUser = await userModel.SoftDeleteUser(user_id);

    if (!deletedUser || !deletedSalesAgent) {
      return res.status(500).json({ message: "Failed to delete sales agent" });
    }

    res.status(200).json({ message: "Sales agent deleted successfully" });
  }
);

export const getDashboardData = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const totalSalesCoaches = await userModel.getTotalSalesCoaches();
      const totalSalesAgents = await salesAgentModel.getTotalSalesAgents();
      const totalApplications = await applicationModel.getTotalApplications();
      const incompleteApplicationsThisWeek =
        await applicationModel.getIncompleteApplicationsThisWeek();

      const dashboardData = {
        totalSalesCoaches,
        totalSalesAgents,
        totalApplications,
        incompleteApplicationsThisWeek,
      };

      res.status(200).json(dashboardData);
    } catch (error) {
      console.error("Error in getDashboardData:", error);
      res.status(500).json([]);
    }
  }
);
