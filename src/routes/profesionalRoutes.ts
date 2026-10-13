import { Router } from 'express'

import { profesionalController } from '../controllers/profesionalController.js'

const router = Router()

router.get('/', profesionalController.listar)

router.get('/mi-perfil', profesionalController.buscarPorUsuarioId)

router.get('/:id', profesionalController.buscarPorId)

export default router
