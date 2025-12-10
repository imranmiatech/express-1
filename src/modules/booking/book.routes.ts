import { Router } from "express";
import { bookController } from "./book.controller";
import auth from "../../middlewire/auth";


const router = Router();

router.post(
  "/",auth('customer','admin'), bookController.createBooking
);
router.get(
  "/",auth('customer','admin'), bookController.getAllBookings
);
router.put(
  "/:bookingId",auth('customer','admin'), bookController.updateBooking
);

export default router;
