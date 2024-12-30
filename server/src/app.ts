import express, { NextFunction, Request, Response } from 'express'
import { createServer } from 'http'
import { initSocket } from './socket'
import cors from 'cors'
import router from './routes/index'
const app = express()

app.use(
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
const httpServer = createServer(app)

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false
  })
})

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

initSocket(httpServer)
export default httpServer
