import express, {Request, Response} from "express";
import { vehicleController } from "./vehicle.controller";
import auth from "../../middlewire/auth";


const router = express.Router();
router.post("/",auth('admin'), vehicleController.vehicleRegister);
router.get("/", vehicleController.getVehicle);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id",auth('admin'), vehicleController.updateVehicle);
router.delete("/:id",auth('admin'), vehicleController.deleteVehicle);

 export const vehicleRoutes = router;