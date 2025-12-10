// import { pool } from "../../config/db";

// interface CreateBookingPayload {
//   customer_id: number;
//   vehicle_id: number;
//   rent_start_date: string;
//   rent_end_date: string;
// }

// const createBooking = async (payload: CreateBookingPayload) => {
//   const {
//     customer_id,
//     vehicle_id,
//     rent_start_date,
//     rent_end_date,
//   } = payload;

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     /* 1️⃣ Get vehicle info & check status */
//     const vehicleQuery = `
//       SELECT id, vehicle_name, daily_rent_price, status
//       FROM vehicles
//       WHERE id = $1
//       FOR UPDATE
//     `;
//     const vehicleResult = await client.query(vehicleQuery, [vehicle_id]);

//     if (vehicleResult.rowCount === 0) {
//       throw new Error("VEHICLE_NOT_FOUND");
//     }

//     const vehicle = vehicleResult.rows[0];

//     if (vehicle.status === "booked") {
//       throw new Error("VEHICLE_NOT_AVAILABLE");
//     }

//     /* 2️⃣ Check overlapping active bookings */
//     const availabilityQuery = `
//       SELECT id FROM rentals
//       WHERE vehicle_id = $1
//         AND status = 'active'
//         AND NOT (
//           rent_end_date < $2
//           OR rent_start_date > $3
//         )
//       LIMIT 1
//     `;
//     const availabilityResult = await client.query(availabilityQuery, [
//       vehicle_id,
//       rent_start_date,
//       rent_end_date,
//     ]);

//     if (availabilityResult.rows.length > 0) {
//       throw new Error("VEHICLE_NOT_AVAILABLE");
//     }

//     /* 3️⃣ Calculate total price */
//     const startDate = new Date(rent_start_date);
//     const endDate = new Date(rent_end_date);

//     if (endDate < startDate) {
//       throw new Error("INVALID_DATE_RANGE");
//     }

//     const oneDay = 1000 * 60 * 60 * 24;
//     const totalDays =
//       Math.floor((endDate.getTime() - startDate.getTime()) / oneDay) + 1;

//     const totalPrice = totalDays * Number(vehicle.daily_rent_price);

//     /* 4️⃣ Insert booking */
//     const bookingInsertQuery = `
//       INSERT INTO rentals (
//         customer_id,
//         vehicle_id,
//         rent_start_date,
//         rent_end_date,
//         total_price,
//         status
//       )
//       VALUES ($1, $2, $3, $4, $5, 'active')
//       RETURNING *
//     `;
//     const bookingResult = await client.query(bookingInsertQuery, [
//       customer_id,
//       vehicle_id,
//       rent_start_date,
//       rent_end_date,
//       totalPrice,
//     ]);

//     /* 5️⃣ Update vehicle status */
//     const updateVehicleQuery = `
//       UPDATE vehicles
//       SET status = 'booked'
//       WHERE id = $1
//     `;
//     await client.query(updateVehicleQuery, [vehicle_id]);

//     await client.query("COMMIT");

//     return bookingResult;
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// export const bookingServices = {
//   createBooking,
// };
import { pool } from "../../config/db";

interface CreateBookingPayload {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

const createBooking = async (payload: CreateBookingPayload) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

   
    const vehicleResult = await client.query(
      `SELECT id, vehicle_name, daily_rent_price, availability_status
       FROM vehicles
       WHERE id = $1
       FOR UPDATE`,
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      return("VEHICLE_NOT_FOUND");
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status === "booked") {
      return("VEHICLE_NOT_AVAILABLE");
    }

    const availabilityResult = await client.query(
      `SELECT id FROM rentals
       WHERE vehicle_id = $1
         AND status = 'active'
         AND NOT (
           rent_end_date < $2 OR rent_start_date > $3
         )
       LIMIT 1`,
      [vehicle_id, rent_start_date, rent_end_date]
    );

    if (availabilityResult.rows.length > 0) {
      return("VEHICLE_NOT_AVAILABLE");
    }

    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);

    if (end <= start) {
      return("INVALID_DATE_RANGE");
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const totalDays =
      Math.floor((end.getTime() - start.getTime()) / oneDay);

    const totalPrice =
      totalDays * Number(vehicle.daily_rent_price);


    const bookingInsert = await client.query(
      `INSERT INTO rentals (
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        total_price,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *`,
      [
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        totalPrice,
      ]
    );

  
    await client.query(
      `UPDATE vehicles
       SET availability_status = 'booked'
       WHERE id = $1`,
      [vehicle_id]
    );

    await client.query("COMMIT");

    return {
      ...bookingInsert.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const getAllBookings = async (user: { id: number; role: string }) => {
 
  if (user.role === "admin") {
    const result = await pool.query(`
      SELECT
        r.id,
        r.customer_id,
        r.vehicle_id,
        r.rent_start_date,
        r.rent_end_date,
        r.total_price,
        r.status,
        u.name AS customer_name,
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number
      FROM rentals r
      JOIN users u ON r.customer_id = u.id
      JOIN vehicles v ON r.vehicle_id = v.id
      ORDER BY r.created_at DESC
    `);

    return result.rows;
  }

 
  const result = await pool.query(
    `
    SELECT
      r.id,
      r.vehicle_id,
      r.rent_start_date,
      r.rent_end_date,
      r.total_price,
      r.status,
      v.vehicle_name,
      v.registration_number,
      v.type
    FROM rentals r
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.customer_id = $1
    ORDER BY r.created_at DESC
    `,
    [user.id]
  );

  return result.rows;
};


const updateBooking = async (
  bookingId: number,
  status: "cancelled" | "returned",
  user: { id: number; role: string }
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookingResult = await client.query(
      `SELECT * FROM rentals WHERE id = $1 FOR UPDATE`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return("BOOKING_NOT_FOUND");
    }

    const booking = bookingResult.rows[0];

    
    if (user.role === "customer") {
      if (booking.customer_id !== user.id || status !== "cancelled") {
        return("UNAUTHORIZED_ACTION");
      }
    }

    if (user.role === "admin") {
      if (status !== "returned") {
        throw new Error("UNAUTHORIZED_ACTION");
      }
    }

    const updatedBooking = await client.query(
      `
      UPDATE rentals
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, bookingId]
    );

    await client.query(
      `
      UPDATE vehicles
      SET availability_status = 'available'
      WHERE id = $1
      `,
      [booking.vehicle_id]
    );

    await client.query("COMMIT");

    return updatedBooking.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,getAllBookings, updateBooking,
};
