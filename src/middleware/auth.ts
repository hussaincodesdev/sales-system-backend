import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    (req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};
