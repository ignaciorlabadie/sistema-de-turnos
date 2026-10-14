import { Router } from 'express'

import {
    obtenerProfesionales,
    obtenerProfesionalPorId,
    obtenerMiPerfilProfesional,
    registrarProfesional,
    modificarProfesional,
    modificarMiPerfilProfesional,
} from '../controllers/profesionalController.js'

import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarRol } from '../middlewares/rolMiddleware.js'

const router = Router()

router.post('/', verificarToken, verificarRol('ADMIN'), registrarProfesional)

router.get('/', verificarToken, verificarRol('ADMIN'), obtenerProfesionales)

router.get('/me', verificarToken, obtenerMiPerfilProfesional)

router.put('/me', verificarToken, modificarMiPerfilProfesional)

router.get(
    '/:id',
    verificarToken,
    verificarRol('ADMIN'),
    obtenerProfesionalPorId,
)

router.put('/:id', verificarToken, verificarRol('ADMIN'), modificarProfesional)

export default router
