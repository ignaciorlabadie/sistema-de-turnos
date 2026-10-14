import { Op } from 'sequelize'

import { Turno, Profesional, Agenda } from '../models/index.js'
import type { CrearTurno } from '../types/CrearTurno.js'

export async function crearTurno(datos: CrearTurno) {
    return Turno.create({
        pacienteId: datos.pacienteId,
        profesionalId: datos.profesionalId,
        agendaId: datos.agendaId,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: datos.motivo,
        observaciones: datos.observaciones ?? null,
        estado: 'PENDIENTE',
    })
}

export async function existeTurnoEnHorario(
    agendaId: number,
    fecha: string,
    hora: string,
) {
    const cantidad = await Turno.count({
        where: {
            agendaId,
            fecha,
            hora,
            estado: { [Op.ne]: 'CANCELADO' },
        },
    })

    return cantidad > 0
}

export async function buscarTurnoPorId(id: number) {
    return Turno.findByPk(id, {
        include: [
            {
                model: Profesional,
                as: 'profesional',
                attributes: ['id', 'nombre', 'apellido', 'especialidad'],
            },
            {
                model: Agenda,
                as: 'agenda',
            },
        ],
    })
}

export async function listarTurnosDePaciente(pacienteId: number) {
    return Turno.findAll({
        where: { pacienteId },
        include: [
            {
                model: Profesional,
                as: 'profesional',
                attributes: ['id', 'nombre', 'apellido', 'especialidad'],
            },
        ],
        order: [
            ['fecha', 'DESC'],
            ['hora', 'DESC'],
        ],
    })
}

export async function cancelarTurno(turno: Turno) {
    turno.estado = 'CANCELADO'
    return turno.save()
}
