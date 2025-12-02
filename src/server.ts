import express, { Request, Response } from 'express'
import { Pool } from "pg";
import dotenv from "dotenv"
import path from "path"

dotenv.config({path: path.join(process.cwd(), ".env")})

const app = express()
const port = 5000


const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STR}`
})


const initDB = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos(
      id SERIAL PRIMARY KEY,
      USER_ID INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT false,
      due_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
};

initDB();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Ihan!')
})

app.post('/user',async (req: Request, res: Response) => {
  const {name, email} = req.body;
  try {
    const result = await pool.query(`INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`, [name, email])
     res.status(201).json({
    success: true,
    message: "data posted", 
    data: result.rows[0]
   })
  } catch (error) {
     res.status(500).json({
    success: false,
    message: "data not posted"
  })
  }
})

app.get('/user', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    
    res.json({
      success: true,
      message: 'All users',
      data: result.rows,
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});


app.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE ID=$1`,[req.params.id]);
    
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
});
app.put('/user/:id', async (req: Request, res: Response) => {
   const {name, email} = req.body;
  try {
    const result = await pool.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,[name, email, req.params.id]);  
   if(result.rows.length === 0){
    res.status(404).json({
      success: false,
      message: "User not found"
    })
   } else {
    res.status(200).json({
      success: true,
      message: "user updated successfully!",
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
});
app.delete('/user/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`DELETE FROM users where id = $1`,[req.params.id]);  
   if(result.rowCount === 0){
    res.status(404).json({
      success: false,
      message: "User not found"
    })
   } else {
    res.status(200).json({
      success: true,
      message: "user dalated successfully!",
      data: null,
    })
   }

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err
    });
  }
});
app.use((req, res)=>{
  res.status(404).json({
    success: false,
    message: "rOUTE NOT FOUND",
    path: req.path
  })
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
