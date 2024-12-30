import mongoose from 'mongoose'

export interface ILog {
  paid: boolean
  bill: number
  userId?: mongoose.Types.ObjectId
  licensePlate: string
  cardId: mongoose.Types.ObjectId
  createdAt?: Date
}
