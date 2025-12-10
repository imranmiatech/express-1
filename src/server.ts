import express, { Request, Response } from 'express'
import config from './config';
import initDB , {pool} from './config/db';
import logger from './middlewire/logger';
import { userRoutes } from './modules/user/user.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';

const app = express()
const port = config.port;
//DB
initDB();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Ihan!')
})
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/vehicles", vehicleRoutes)
app.use("/api/v1/bookings", vehicleRoutes)





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
