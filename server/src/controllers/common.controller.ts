import { setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { NextFunction, Request, Response } from 'express'
import env from '~/config/env'
import Log from '~/models/logs.model'
import Slot from '~/models/slots.model'
import Warning from '~/models/warnings.model'
import { signAccessToken } from '~/utils/jwt'

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      throw new Error('Code và mật khẩu là bắt buộc')
    }

    if (username !== env.USERNAME_DEFAULT || password !== env.PASSWORD_DEFAULT) {
      throw new Error('Sai tài khoản hoặc mật khẩu')
    }

    // Generate JWT token
    const token = await signAccessToken({
      _id: 'theanh_deptrai'
    })

    res.json({ success: true, token })
  } catch (error) {
    next(error)
  }
}

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let date = req.body.date
    if (!date) {
      date = new Date().toISOString()
    }

    const timeZone = 'Asia/Ho_Chi_Minh'

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    const zonedDate = toZonedTime(parsedDate, timeZone)

    const startTime = setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, 0), 0), 0), 0) // 00:00:00.000
    const endTime = setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, 23), 59), 59), 999) // 23:59:59.999

    const logs = await Log.find({
      createdAt: {
        $gte: startTime,
        $lte: endTime
      }
    })

    res.status(200).json(logs)
  } catch (error) {
    next(error)
  }
}

export const getWarnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let date = req.body.date
    if (!date) {
      date = new Date().toISOString()
    }

    const timeZone = 'Asia/Ho_Chi_Minh'

    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    const zonedDate = toZonedTime(parsedDate, timeZone)

    const startTime = setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, 0), 0), 0), 0) // 00:00:00.000
    const endTime = setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, 23), 59), 59), 999) // 23:59:59.999

    const warnings = await Warning.find({
      createdAt: {
        $gte: startTime,
        $lte: endTime
      }
    })

    res.status(200).json(warnings)
  } catch (error) {
    next(error)
  }
}

export const getSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await Slot.find()
    res.status(200).json(slots)
  } catch (error) {
    next(error)
  }
}

export const getCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cars = await Log.find({
      paid: false
    })
    res.status(200).json(cars)
  } catch (error) {
    next(error)
  }
}
