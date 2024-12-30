import mongoose from 'mongoose'

export interface IWarning {
  userId?: mongoose.Types.ObjectId
  cardId?: mongoose.Types.ObjectId
  desc: string
}
