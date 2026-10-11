import { Router } from 'express'

import authRoutes from './authRoutes.js'
import usuarioRoutes from './usuarioRoutes.js'
import espacioRoutes from './espacioRoutes.js'

const router = Router()

router.use('api/auth', authRoutes)
router.use('api/usuarios', usuarioRoutes)
router.use('/api/espacios', espacioRoutes)

export default router
