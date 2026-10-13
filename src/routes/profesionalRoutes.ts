import { Router } from 'express'

import { profesionalController } from '../controllers/profesionalController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'
import {
    verificarAdminOPropio,
    verificarRol,
} from '../middlewares/rolMiddleware.js'

const router = Router()

router.get(
    '/',
    verificarToken,
    verificarRol('ADMIN'),
    profesionalController.listar,
)

router.get(
    '/mi-perfil',
    verificarToken,
    profesionalController.buscarPorUsuarioId,
)

router.get(
    '/:id',
    verificarToken,
    verificarRol('ADMIN'),
    profesionalController.buscarPorId,
)

router.post(
    '/',
    verificarToken,
    verificarRol('ADMIN'),
    profesionalController.crear,
)

router.put(
    '/:id',
    verificarToken,
    verificarAdminOPropio,
    profesionalController.actualizar,
)

export default router
