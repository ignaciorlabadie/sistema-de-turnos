import { Router } from 'express'

import {
    obtenerMisTurnos,
    sacarTurno,
    cancelarMiTurno,
} from '../controllers/turnoController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarRol } from '../middlewares/rolMiddleware.js'

const router = Router()

router.use(verificarToken)

router.get('/me', verificarRol('PACIENTE'), obtenerMisTurnos)

router.post('/me', verificarRol('PACIENTE'), sacarTurno)

router.patch('/me/:id/cancelar', verificarRol('PACIENTE'), cancelarMiTurno)

export default router
