import { pool } from "../../config/db";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signUp = async (payload: Record<string, any>) => {
  const {name, email, password, phone, role} = payload;
  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const loginUser = async(email: string, password: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if(result.rows.length === 0){
        return null;
    }
    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if(!match){
        return false;
    }
   const sceret = "iufheru8gegdrgywrewth"
   const token = jwt.sign({name: user.name, email: user.email}, sceret, {expiresIn: '7d'});
   console.log({token});
    return {token, user}
    
}

export const authServices = {
    signUp,loginUser
}