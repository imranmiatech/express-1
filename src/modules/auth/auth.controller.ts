import { Request, Response } from "express";
import { authServices } from "./auth.service";
const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await authServices.loginUser(email, password);
    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const { token, user } = result;
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: userWithoutPassword },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "data not posted",
    });
  }
};
const signUp = async (req: Request, res: Response) => {
  try {
    const result = await authServices.signUp(req.body);
    const { password, ...userWithoutPassword } = result.rows[0];
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "User not created",
      error: error.message,
    });
  }
};
export const authController = {
  loginUser,
  signUp,
};
