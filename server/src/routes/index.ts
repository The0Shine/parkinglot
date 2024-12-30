import { Router } from 'express'
import userRouter from './user.routes'
import cardRouter from './card.routes'
import { getCar, getLogs, getSlots, getWarnings, login } from '~/controllers/common.controller'
import auth from '~/middlewares/auth.middleware'

const router = Router()
router.post('/login', login)
router.use(auth)
router.use('/users', userRouter)
router.use('/cards', cardRouter)
router.post('/logs', getLogs)
router.get('/slots', getSlots)
router.post('/warnings', getWarnings)
router.get('/car', getCar)

export default router
