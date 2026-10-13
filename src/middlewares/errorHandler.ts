import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../errors/AppError.js'

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (error instanceof AppError) {
        if (error.statusCode >= 500) {
            console.error(error)

            return res.status(500).json({
                mensaje: 'Error interno del servidor',
            })
        }

        return res.status(error.statusCode).json({
            mensaje: error.message,
        })
    }

    console.error(error)

    return res.status(500).json({
        mensaje: 'Error interno del servidor',
    })
}
