import { Router } from 'express'
import { createUser, deleteUser, getUser, updateUser, updateUserWithCard } from '~/controllers/users.controller'

const router = Router()

router.get('/', getUser)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.patch('/:id', updateUserWithCard)

export default router
