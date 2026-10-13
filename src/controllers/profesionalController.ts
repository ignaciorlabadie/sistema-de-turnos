import type { NextFunction, Request, Response } from 'express'

import { profesionalService } from '../services/profesionalService.js'
import { AppError } from '../errors/AppError.js'
import { MENSAJES } from '../errors/mensajes.js'

export class ProfesionalController {
    async listar(_req: Request, res: Response, next: NextFunction) {
        try {
            const profesionales = await profesionalService.listar()

            return res.status(200).json(profesionales)
        } catch (error) {
            next(error)
        }
    }

    async buscarPorId(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)

            if (!Number.isInteger(id) || id <= 0) {
                throw new AppError(
                    400,
                    'El ID debe ser un número entero positivo',
                )
            }

            const profesional = await profesionalService.buscarPorId(id)

            if (!profesional) {
                throw new AppError(404, 'Profesional no encontrado')
            }

            return res.status(200).json(profesional)
        } catch (error) {
            next(error)
        }
    }

    async buscarPorUsuarioId(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.usuario?.id

            if (usuarioId === undefined) {
                throw new AppError(401, MENSAJES.AUTENTICACION_REQUERIDA)
            }

            const profesional =
                await profesionalService.buscarPorUsuarioId(usuarioId)

            if (!profesional) {
                throw new AppError(404, 'Profesional no encontrado')
            }

            return res.status(200).json(profesional)
        } catch (error) {
            next(error)
        }
    }

    async crear(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                nombre,
                apellido,
                dni,
                telefono,
                matricula,
                especialidad,
                usuarioId,
            } = req.body

            if (
                typeof nombre !== 'string' ||
                !nombre.trim() ||
                typeof apellido !== 'string' ||
                !apellido.trim() ||
                typeof dni !== 'string' ||
                !dni.trim() ||
                typeof telefono !== 'string' ||
                !telefono.trim() ||
                typeof matricula !== 'string' ||
                !matricula.trim() ||
                typeof especialidad !== 'string' ||
                !especialidad.trim() ||
                typeof usuarioId !== 'number' ||
                !Number.isInteger(usuarioId) ||
                usuarioId <= 0
            ) {
                throw new AppError(400, 'Datos de profesional inválidos')
            }

            const profesional = await profesionalService.crear({
                usuarioId,
                nombre,
                apellido,
                dni,
                telefono,
                matricula,
                especialidad,
            })

            return res.status(201).json(profesional)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    mensaje: error.message,
                })
            }

            next(error)
        }
    }
}

export const profesionalController = new ProfesionalController()
