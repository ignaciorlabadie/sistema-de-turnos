import { Router } from 'express'

import authRoutes from './authRoutes.js'
import usuarioRoutes from './usuarioRoutes.js'
import pacienteRoutes from './pacienteRoutes.js'
import profesionalRoutes from './profesionalRoutes.js'
import espacioRoutes from './espacioRoutes.js'
import estudioRoutes from './estudioRoutes.js'
import turnoRoutes from './turnoRoutes.js'

const router = Router()

router.use('/api/auth', authRoutes)
router.use('/api/usuarios', usuarioRoutes)
router.use('/api/pacientes', pacienteRoutes)
router.use('/api/profesionales', profesionalRoutes)
router.use('/api/espacios', espacioRoutes)
router.use('/api/estudios', estudioRoutes)
router.use('/api/turnos', turnoRoutes)

export default router
