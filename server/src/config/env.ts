import dotenv from 'dotenv'
dotenv.config()

const env = {
  PORT: process.env.PORT || 8888,
  DB: process.env.DB || 'mongodb://localhost:27017/',
  DB_NAME: process.env.DB_NAME,
  BUILD_MODE: process.env.BUILD_MODE,
  JWT_SECRETS_AT: process.env.JWT_SECRETS_AT,
  ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION,
  USERNAME_DEFAULT: process.env.USERNAME_DEFAULT,
  PASSWORD_DEFAULT: process.env.PASSWORD_DEFAULT
} as const
export default env
