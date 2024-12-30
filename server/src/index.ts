import mongoose from 'mongoose'
import server from './app'
import exitHook from 'async-exit-hook'
import env from './config/env'
mongoose.set('strictQuery', false)
//CONNECTION TO MONGOOSE DATABASE
const checkConnection = () => {
  switch (mongoose.connection.readyState) {
    case 0:
      console.log('Mongoose is disconnected.')
      break
    case 1:
      console.log('Mongoose is connected.')
      break
    case 2:
      console.log('Mongoose is connecting...')
      break
    case 3:
      console.log('Mongoose is disconnecting...')
      break
    default:
      console.log('Unknown connection state.')
  }
}

mongoose
  .connect(env.DB, { retryWrites: true, w: 'majority' })
  .then(async () => {
    console.log(`Running on ENV = ${env.BUILD_MODE}`)
    console.log('Connected to mongoDB.')
    checkConnection()
    StartServer()
    exitHook(() => {})
  })
  .catch((error) => {
    console.log('Unable to connect.')
    console.log(error)
    checkConnection()
  })

const StartServer = () => {
  server.listen({ port: env.PORT }, () => {
    console.log(`Server running at http://localhost:${env.PORT}`)
  })
}
