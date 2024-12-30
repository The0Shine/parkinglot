import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '~/config/env'

export interface IAccessTokenPayload extends JwtPayload {
  _id: string
}

export const signAccessToken = (payload: IAccessTokenPayload) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      env.JWT_SECRETS_AT as string,
      {
        expiresIn: env.ACCESS_TOKEN_EXPIRATION
      },
      (err, token) => {
        if (err) reject(err)
        else resolve(token as string)
      }
    )
  })
export const decodeAccessToken = async (token: string) => {
  return new Promise<IAccessTokenPayload>((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRETS_AT as string, (err, payload) => {
      if (err) reject(err)
      else resolve(payload as IAccessTokenPayload)
    })
  })
}
