import { pool } from "../../config/db"



const getUser = async () => {
   const result = await pool.query(`SELECT * FROM users`);
    return result;
}
const getUserById = async (id: string) => {
  const result =  await pool.query(`SELECT * FROM users WHERE ID=$1`,[id]);
  return result
}

const updateUser = async( name: string, email: string, id:string) => {
    const result =  await pool.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,[name, email,id]);  
    return result;
}
const deleteUser = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );
  return result;
};
export const userServices = {
    getUser,
    getUserById,
    updateUser,
    deleteUser
}