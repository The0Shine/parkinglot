import { NextFunction, Request, Response } from 'express'
import Log from '~/models/logs.model'
import User from '~/models/users.model'

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, cccd } = req.body
    if (!name || !phone || !cccd) throw new Error('Thông tin người dùng không hợp lệ')

    const user = new User({
      name,
      phone,
      cccd
    })

    await user.save()
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, cccd } = req.body
    if (!name || !phone || !cccd) throw new Error('Thông tin người dùng không hợp lệ')
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, cccd }, { new: true })

    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().populate('cardId')

    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id
    })

    if (!user) throw new Error('Người dùng không tồn tại')
    await Log.deleteOne({
      userId: user._id,
      paid: false
    })

    res.status(205).json()
  } catch (error) {
    next(error)
  }
}

export const updateUserWithCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.body
    const id = req.params.id
    console.log(cardId)
    console.log(111)
    console.log(id)

    const user = await User.findByIdAndUpdate(id, { cardId })
    if (!user) throw new Error('Người dùng không tồn tại')
    if (user.cardId) {
      await Log.deleteOne({
        userId: user._id,
        cardId: user.cardId,
        paid: false
      })
    }
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}
