import { Request } from 'express'
import { IAccessTokenPayload } from './utils/jwt'
declare module 'express' {
  interface Request {
    tokenPayload?: IAccessTokenPayload
  }
}
