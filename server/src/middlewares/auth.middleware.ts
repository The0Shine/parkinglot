import { Request, Response, NextFunction } from 'express'
import { decodeAccessToken } from '../utils/jwt'
import { error } from 'console'
const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization
    if (!authorization) return res.status(403).json({ message: 'No token provided' })
    const token = authorization.split(' ')[1]
    const payload = await decodeAccessToken(token)
    req.tokenPayload = payload
    next()
  } catch (e) {
    next(error)
  }
}

export default auth
