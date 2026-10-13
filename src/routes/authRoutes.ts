import { Router } from 'express'

import { login, obtenerPerfil } from '../controllers/authController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/login', login)
router.get('/me', verificarToken, obtenerPerfil)

export default router
