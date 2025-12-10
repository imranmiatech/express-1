import {Request, Response} from "express";
import { userServices } from "./user.service";





const getUser=  async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUser()
     const usersWithoutPassword = result.rows.map(({ password, ...rest }) => rest);
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: usersWithoutPassword
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
}

const getUserById = async (req: Request, res: Response) => {
  try {
    const result =  await userServices.getUserById(req.params.id as string);
    
   if(result.rows.length === 0){
    res.status(404).json({
      success: false,
      message: "User not found"
    })
   } else {
    res.status(200).json({
      success: true,
      message: "user fatch successfully!",
      data: result.rows[0]
    })
   }

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
}
const updateUser =  async (req: Request, res: Response) => {
   const {name, email} = req.body;
  try {
    const result = await  userServices.updateUser(name,email, req.params.id as string);
    
   if(result.rows.length === 0){
    res.status(404).json({
      success: false,
      message: "USER NOT FOUND",
      
    })
   } else {
     const { password, ...userWithoutPassword } = result.rows[0];
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword
    })
   }

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err
    });
  }
}
const deleteUser =  async (req: Request, res: Response) => {
  try {
    const result = await  userServices.deleteUser( req.params.id as string);
   if(result.rowCount === 0){
    res.status(404).json({
      success: false,
      message: "User not found"
    })
   } else {
    res.status(200).json({
      success: true,
      message: "user dalated successfully"
    })
   }

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err
    });
  }
}
export const userController = {
   getUser, getUserById, updateUser, deleteUser
}