import type { Request, Response } from 'express'

import { buscarPacientePorUsuarioId } from '../services/pacienteService.js'
import { listarTurnosDePaciente } from '../services/turnoService.js'
import {
    reservarTurno,
    cancelarTurnoDePaciente,
} from '../facades/reservaTurnoFacade.js'
import { AppError } from '../errors/AppError.js'
import { MENSAJES } from '../errors/mensajes.js'
import { esFechaValida } from '../utils/validation.js'
import { validarId } from '../utils/validarId.js'

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

async function resolverPaciente(req: Request) {
    const usuarioId = req.usuario?.id

    if (usuarioId === undefined) {
        throw new AppError(401, MENSAJES.AUTENTICACION_REQUERIDA)
    }

    const paciente = await buscarPacientePorUsuarioId(usuarioId)

    if (!paciente) {
        throw new AppError(404, 'Paciente no encontrado')
    }

    return paciente
}

export async function obtenerMisTurnos(req: Request, res: Response) {
    const paciente = await resolverPaciente(req)

    const turnos = await listarTurnosDePaciente(paciente.id)

    return res.status(200).json(turnos)
}

export async function sacarTurno(req: Request, res: Response) {
    const paciente = await resolverPaciente(req)

    const { profesionalId, agendaId, fecha, hora, motivo, observaciones } =
        req.body

    const idProfesional = validarId(profesionalId, 'ID del profesional')
    const idAgenda = validarId(agendaId, 'ID de la agenda')

    if (typeof fecha !== 'string' || !esFechaValida(fecha)) {
        throw new AppError(400, 'La fecha debe tener el formato YYYY-MM-DD')
    }

    if (typeof hora !== 'string' || !HORA_REGEX.test(hora)) {
        throw new AppError(400, 'La hora debe tener el formato HH:MM')
    }

    if (
        typeof motivo !== 'string' ||
        motivo.trim().length < 1 ||
        motivo.trim().length > 255
    ) {
        throw new AppError(400, 'El motivo debe tener entre 1 y 255 caracteres')
    }

    if (
        observaciones !== undefined &&
        observaciones !== null &&
        typeof observaciones !== 'string'
    ) {
        throw new AppError(400, 'Las observaciones deben ser texto')
    }

    const turno = await reservarTurno({
        pacienteId: paciente.id,
        profesionalId: idProfesional,
        agendaId: idAgenda,
        fecha,
        hora,
        motivo: motivo.trim(),
        observaciones: observaciones ?? null,
    })

    return res.status(201).json(turno)
}

export async function cancelarMiTurno(req: Request, res: Response) {
    const paciente = await resolverPaciente(req)

    const id = validarId(req.params.id, 'ID del turno')

    const turno = await cancelarTurnoDePaciente(paciente.id, id)

    return res.status(200).json(turno)
}
