
import { Request, Response } from "express";
import { bookingServices } from "./book.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

    // basic validation
    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "সব ফিল্ড আবশ্যক",
      });
    }

    const result = await bookingServices.createBooking({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Booking create error:", error);

    if (error.message === "VEHICLE_NOT_AVAILABLE") {
      return res.status(409).json({
        success: false,
        message: "এই তারিখে গাড়িটি আগে থেকেই বুক করা আছে",
      });
    }

    res.status(500).json({
      success: false,
      message: "Booking created failed",
      errors: error.message,
    });
  }
};




const getAllBookings = async (req: Request, res: Response) => {
  try {

    const user = (req as any).user; 

    const result = await bookingServices.getAllBookings(user);

    res.status(200).json({
      success: true,
      message:
        user.role === "admin"
          ? "Bookings retrieved successfully"
          : "Your bookings retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      errors: error.message,
    });
  }
};


const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body;
    const user = (req as any).user; 
    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and status are required",
      });
    }

    const result = await bookingServices.updateBooking(
      bookingId,
      status,
      user
    );

    res.status(200).json({
      success: true,
      message:
        status === "cancelled"
          ? "Booking cancelled successfully"
          : "Booking marked as returned. Vehicle is now available",
      data: result,
    });
  } catch (error: any) {
    console.error("Update booking error:", error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (error.message === "UNAUTHORIZED_ACTION") {
      return res.status(403).json({
        success: false,
        message: "unauthorized to perform this action",
      });
    }

    res.status(500).json({
      success: false,
      message: "Booking update failed",
      errors: error.message,
    });
  }
};
export const bookController = {
  createBooking,
  getAllBookings,
  updateBooking
};

