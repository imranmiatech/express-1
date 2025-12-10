import express, {Request, Response} from "express";
import { userController } from "./user.controller";

const router = express.Router();
router.get('/',userController.getUser);
router.get('/:id',userController.getUserById );
router.put('/:id', userController.updateUser );
router.delete('/:id', userController.deleteUser);

export const userRoutes = router;