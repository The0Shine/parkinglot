import mongoose from 'mongoose'

export interface IUser {
  phone: string
  name: string
  cccd: string
  cardId?: mongoose.Types.ObjectId
}
