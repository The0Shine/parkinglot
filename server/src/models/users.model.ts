import mongoose, { Schema } from 'mongoose'
import { IUser } from '~/interfaces/user.interface'

export interface IUserModel extends IUser {}

const UserSchema: Schema = new Schema<IUserModel>({
  cccd: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  cardId: {
    type: Schema.Types.ObjectId,
    ref: 'Cards',
    required: false,
    default: null
  }
})

const User = mongoose.model<IUserModel>('Users', UserSchema)

export default User
