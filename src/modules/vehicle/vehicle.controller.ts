import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";


const vehicleRegister = async (req: Request, res: Response) => {
   try {
    const result = await vehicleServices.vehicleRegister(req.body)
    res.status(201).json({
      success: true,
      message: "Vehicle registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Vehicle create error:", error);
    res.status(500).json({
      success: false,
      message: "Vehicle not created",
      error: error.message,
    });
  }
}
const getVehicle=  async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicle()
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.rows
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
}

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const result =  await vehicleServices.getVehicleById(req.params.id as string);
    
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

const updateVehicle =  async (req: Request, res: Response) => {
   const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body;
  try {
    const result = await vehicleServices.updateVehicle(vehicle_name, type, registration_number, daily_rent_price, availability_status, req.params.id as string);
    
   if(result.rows.length === 0){
    res.status(404).json({
      success: false,
      message: "USER NOT FOUND",
      
    })
   } else {
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
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
const deleteVehicle =  async (req: Request, res: Response) => {
  try {
    const result = await  vehicleServices.deleteVehicle( req.params.id as string);
   if(result.rowCount === 0){
    res.status(404).json({
      success: false,
      message: "vehicle not found"
    })
   } else {
    res.status(200).json({
      success: true,
      message: "vehicle dalated successfully"
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
export const vehicleController = {
    vehicleRegister, getVehicle, getVehicleById, updateVehicle, deleteVehicle
};