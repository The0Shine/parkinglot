import { Request, Response, Router } from 'express'
import { addCard, deleteCard, getAllCard, getCardNotInUse, updateCard } from '~/controllers/cards.controller'

const router = Router()

router.get('/', getAllCard)
router.get('/not-use', getCardNotInUse)
router.post('/', addCard)
router.put('/:id', updateCard)
router.delete('/:id', deleteCard)

export default router
