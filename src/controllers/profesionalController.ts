import type { Request, Response } from 'express'

import {
    listarProfesionales,
    buscarProfesionalPorId,
    buscarProfesionalPorUsuarioId,
    crearProfesional,
    actualizarProfesional,
} from '../services/profesionalService.js'

import { AppError } from '../errors/AppError.js'
import { MENSAJES } from '../errors/mensajes.js'
import {
    esEmailValido,
    esPasswordValida,
    esDniValido,
    esTelefonoValido,
} from '../utils/validation.js'

function validarId(req: Request): number {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(400, 'El ID debe ser un número entero positivo')
    }

    return id
}

function esTextoValido(
    valor: unknown,
    min: number,
    max: number,
): valor is string {
    if (typeof valor !== 'string') {
        return false
    }

    const longitud = valor.trim().length

    return longitud >= min && longitud <= max
}

function validarDatosActualizacion(body: Request['body']) {
    const { nombre, apellido, dni, telefono, matricula, especialidad } = body

    if (
        nombre === undefined &&
        apellido === undefined &&
        dni === undefined &&
        telefono === undefined &&
        matricula === undefined &&
        especialidad === undefined
    ) {
        throw new AppError(400, 'Datos de actualización inválidos')
    }

    if (
        (nombre !== undefined && !esTextoValido(nombre, 2, 100)) ||
        (apellido !== undefined && !esTextoValido(apellido, 2, 100)) ||
        (dni !== undefined && (typeof dni !== 'string' || !esDniValido(dni))) ||
        (telefono !== undefined &&
            (typeof telefono !== 'string' || !esTelefonoValido(telefono))) ||
        (matricula !== undefined && !esTextoValido(matricula, 1, 30)) ||
        (especialidad !== undefined && !esTextoValido(especialidad, 2, 100))
    ) {
        throw new AppError(400, 'Datos de actualización inválidos')
    }

    return { nombre, apellido, dni, telefono, matricula, especialidad }
}

export async function obtenerProfesionales(_req: Request, res: Response) {
    const profesionales = await listarProfesionales()

    return res.status(200).json(profesionales)
}

export async function obtenerProfesionalPorId(req: Request, res: Response) {
    const id = validarId(req)

    const profesional = await buscarProfesionalPorId(id)

    if (!profesional) {
        throw new AppError(404, 'Profesional no encontrado')
    }

    return res.status(200).json(profesional)
}

export async function obtenerMiPerfilProfesional(req: Request, res: Response) {
    const usuarioId = req.usuario?.id

    if (usuarioId === undefined) {
        throw new AppError(401, MENSAJES.AUTENTICACION_REQUERIDA)
    }

    const profesional = await buscarProfesionalPorUsuarioId(usuarioId)

    if (!profesional) {
        throw new AppError(404, 'Profesional no encontrado')
    }

    return res.status(200).json(profesional)
}

export async function registrarProfesional(req: Request, res: Response) {
    const {
        email,
        password,
        nombre,
        apellido,
        dni,
        telefono,
        matricula,
        especialidad,
    } = req.body

    if (
        typeof email !== 'string' ||
        !esEmailValido(email.trim()) ||
        typeof password !== 'string' ||
        !esPasswordValida(password) ||
        !esTextoValido(nombre, 2, 100) ||
        !esTextoValido(apellido, 2, 100) ||
        typeof dni !== 'string' ||
        !esDniValido(dni) ||
        typeof telefono !== 'string' ||
        !esTelefonoValido(telefono) ||
        !esTextoValido(matricula, 1, 30) ||
        !esTextoValido(especialidad, 2, 100)
    ) {
        throw new AppError(400, 'Datos de profesional inválidos')
    }

    const profesional = await crearProfesional({
        email,
        password,
        nombre,
        apellido,
        dni,
        telefono,
        matricula,
        especialidad,
    })

    return res.status(201).json(profesional)
}

export async function modificarProfesional(req: Request, res: Response) {
    const id = validarId(req)

    const datos = validarDatosActualizacion(req.body)

    const profesional = await actualizarProfesional(id, datos)

    return res.status(200).json(profesional)
}

export async function modificarMiPerfilProfesional(
    req: Request,
    res: Response,
) {
    const usuarioId = req.usuario?.id

    if (usuarioId === undefined) {
        throw new AppError(401, MENSAJES.AUTENTICACION_REQUERIDA)
    }

    const profesional = await buscarProfesionalPorUsuarioId(usuarioId)

    if (!profesional) {
        throw new AppError(404, 'Profesional no encontrado')
    }

    const datos = validarDatosActualizacion(req.body)

    const profesionalActualizado = await actualizarProfesional(
        profesional.id,
        datos,
    )

    return res.status(200).json(profesionalActualizado)
}
