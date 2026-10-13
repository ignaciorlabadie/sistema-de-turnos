import type { Request, Response, NextFunction } from 'express'

import { AppError } from '../errors/AppError.js'
import { MENSAJES } from '../errors/mensajes.js'

type Rol = 'PACIENTE' | 'PROFESIONAL' | 'ADMIN'

export function verificarAdminOPropio(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    if (!req.usuario) {
        throw new AppError(401, MENSAJES.AUTENTICACION_REQUERIDA)
    }

    const id = Number(req.params.id)
    const esElMismoUsuario = id > 0 && req.usuario.id === id

    if (req.usuario.rol !== 'ADMIN' && !esElMismoUsuario) {
        throw new AppError(403, MENSAJES.SIN_PERMISOS)
    }

    return next()
}

export function verificarRol(...rolesPermitidos: Rol[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.usuario) {
            throw new AppError(401, MENSAJES.AUTENTICACION_REQUERIDA)
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            throw new AppError(403, MENSAJES.SIN_PERMISOS)
        }

        return next()
    }
}
