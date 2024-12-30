import mongoose, { Schema } from 'mongoose'
import { ILog } from '~/interfaces/log.interface'

export interface ILogModel extends ILog {}

const LogSchema: Schema = new Schema<ILogModel>(
  {
    bill: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Cards',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: false,
      default: null
    },
    licensePlate: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Log = mongoose.model<ILogModel>('Logs', LogSchema)

export default Log
