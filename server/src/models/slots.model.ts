import mongoose, { Schema } from 'mongoose'
import { ISlot } from '~/interfaces/slot.interface'

export interface ISlotModel extends ISlot {}

const SlotSchema: Schema = new Schema<ISlotModel>({
  empty: {
    type: Boolean,
    default: true
  },
  number: {
    type: Number,
    required: true
  }
})

const Slot = mongoose.model<ISlotModel>('Slots', SlotSchema)

export default Slot
