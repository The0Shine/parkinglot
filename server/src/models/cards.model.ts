import mongoose, { Schema } from 'mongoose'
import { ICard } from '~/interfaces/card.interface'

export interface ICardModel extends ICard {}

const CardSchema: Schema = new Schema<ICardModel>({
  type: {
    type: String,
    required: true,
    enum: ['normal', 'monthly']
  },
  uid: {
    type: String,
    required: true,
    unique: true
  }
})

const Card = mongoose.model<ICardModel>('Cards', CardSchema)

export default Card
