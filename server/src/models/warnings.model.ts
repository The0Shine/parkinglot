import mongoose, { Schema } from 'mongoose'
import { IWarning } from '~/interfaces/warning.interface'

export interface IWarningModel extends IWarning {}

const WarningSchema: Schema = new Schema<IWarningModel>(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Cards',
      required: false,
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: false,
      default: null
    },
    desc: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Warning = mongoose.model<IWarningModel>('Warnings', WarningSchema)

export default Warning
