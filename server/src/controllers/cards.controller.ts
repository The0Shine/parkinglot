import { NextFunction, Request, Response } from 'express'
import Card from '~/models/cards.model'
import Log from '~/models/logs.model'
import User from '~/models/users.model'

export const getAllCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find()
    res.status(200).json(cards)
  } catch (error) {
    next(error)
  }
}

export const getCardNotInUse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy danh sách các card đang được sử dụng
    const cardInUse = await User.find({
      cardId: { $ne: null }
    })
    const cardInUseId = cardInUse.map((card) => card.cardId)

    // Tìm các card không được sử dụng và có type là "monthly"
    const cardNotInUse = await Card.find({
      _id: { $nin: cardInUseId },
      type: 'monthly' // Chỉ lấy các thẻ có type = "monthly"
    })

    // Trả kết quả
    res.status(200).json(cardNotInUse)
  } catch (error) {
    next(error)
  }
}

export const addCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid, type } = req.body
    if (!uid && !type) throw new Error('Uid và type không được để trống')
    const existingCard = await Card.findOne({
      uid
    })
    if (existingCard) throw new Error('Uid đã tồn tại')
    const newCard = new Card({
      uid,
      type
    })
    await newCard.save()
    res.status(201).json(newCard)
  } catch (error) {
    next(error)
  }
}

export const updateCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({
      cardId: req.params.id
    })
    if (user) throw new Error('Không thể sửa card đang sử dụng')
    const { uid, type } = req.body
    if (!uid && !type) throw new Error('Uid và type không được để trống')
    const card = await Card.findByIdAndUpdate(req.params.id, { uid, type }, { new: true })
    if (!card) throw new Error('Không tìm thấy thẻ')
    res.status(200).json(card)
  } catch (error) {
    next(error)
  }
}

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id)
    if (!card) throw new Error('Không tìm thấy thẻ')
    await Promise.all([
      User.findOneAndUpdate(
        {
          cardId: card._id
        },
        {
          cardId: null
        }
      ),
      Log.deleteOne({ cardId: card._id, paid: false })
    ])
    res.status(205).json()
  } catch (error) {
    next(error)
  }
}
