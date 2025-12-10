import { pool } from "../../config/db";

const vehicleRegister = async (payload: Record<string, any>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status = "available", // default
  } = payload;

  const result = await pool.query(
    `INSERT INTO vehicles(
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result;
};

const getVehicle = async () => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result;
};
const getVehicleById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE ID=$1`, [id]);
  return result;
};

const updateVehicle = async (
  vehicle_name: string,
  type: string,
  registration_number: string,
  daily_rent_price: number,
  availability_status: string,
  id: string
) => {
  const result = await pool.query(
    `UPDATE vehicles
     SET vehicle_name = $1,
    type = $2,
    registration_number = $3,
    daily_rent_price = $4,
    availability_status = $5
     WHERE id = $6
     RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      id,
    ]
  );

  return result;
};

const deleteVehicle = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
    [id]
  );
  return result;
};
export const vehicleServices = {
  vehicleRegister,
  getVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
