import { Router } from 'express'

import {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorEmail,
    registrarUsuario,
    modificarUsuario,
    desactivarUsuarioController,
    reactivarUsuarioController,
} from '../controllers/usuarioController.js'

import { verificarToken } from '../middlewares/authMiddleware.js'
import {
    verificarRol,
    verificarAdminOPropio,
} from '../middlewares/rolMiddleware.js'

const router = Router()

router.post('/', registrarUsuario)

router.get('/', verificarToken, verificarRol('ADMIN'), obtenerUsuarios)

router.get(
    '/email/:email',
    verificarToken,
    verificarRol('ADMIN'),
    obtenerUsuarioPorEmail,
)

router.get('/:id', verificarToken, verificarAdminOPropio, obtenerUsuarioPorId)

router.put('/:id', verificarToken, verificarAdminOPropio, modificarUsuario)

router.patch(
    '/:id/desactivar',
    verificarToken,
    verificarRol('ADMIN'),
    desactivarUsuarioController,
)

router.patch(
    '/:id/reactivar',
    verificarToken,
    verificarRol('ADMIN'),
    reactivarUsuarioController,
)

export default router
