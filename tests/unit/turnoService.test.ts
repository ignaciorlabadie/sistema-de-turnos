import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Op } from 'sequelize'

import {
    buscarTurnoPorId,
    cancelarTurno,
    crearTurno,
    existeTurnoEnHorario,
    listarTurnosDePaciente,
} from '../../src/services/turnoService.js'
import { Turno } from '../../src/models/index.js'
import type { CrearTurno } from '../../src/types/CrearTurno.js'

vi.mock('../../src/models/index.js', () => ({
    Turno: {
        create: vi.fn(),
        count: vi.fn(),
        findAll: vi.fn(),
        findByPk: vi.fn(),
    },
    Profesional: {},
    Agenda: {},
}))

const datos: CrearTurno = {
    pacienteId: 10,
    profesionalId: 1,
    agendaId: 2,
    fecha: '2026-12-01',
    hora: '08:00',
    motivo: 'Consulta',
}

beforeEach(() => {
    vi.resetAllMocks()
})

describe('crearTurno', () => {
    it('crea un turno PENDIENTE con observaciones null por defecto', async () => {
        const creado = { id: 5 } as unknown as Turno
        vi.mocked(Turno.create).mockResolvedValue(creado)

        const resultado = await crearTurno(datos)

        expect(Turno.create).toHaveBeenCalledWith({
            pacienteId: 10,
            profesionalId: 1,
            agendaId: 2,
            fecha: '2026-12-01',
            hora: '08:00',
            motivo: 'Consulta',
            observaciones: null,
            estado: 'PENDIENTE',
        })
        expect(resultado).toBe(creado)
    })

    it('respeta las observaciones cuando se envían', async () => {
        vi.mocked(Turno.create).mockResolvedValue({} as unknown as Turno)

        await crearTurno({ ...datos, observaciones: 'Sin gluten' })

        expect(Turno.create).toHaveBeenCalledWith(
            expect.objectContaining({ observaciones: 'Sin gluten' }),
        )
    })
})

describe('existeTurnoEnHorario', () => {
    it('devuelve false cuando no hay turnos en ese horario', async () => {
        vi.mocked(Turno.count).mockResolvedValue(0)

        await expect(
            existeTurnoEnHorario(2, '2026-12-01', '08:00'),
        ).resolves.toBe(false)
    })

    it('devuelve true cuando ya hay un turno en ese horario', async () => {
        vi.mocked(Turno.count).mockResolvedValue(1)

        await expect(
            existeTurnoEnHorario(2, '2026-12-01', '08:00'),
        ).resolves.toBe(true)
    })

    it('excluye los turnos cancelados de la búsqueda', async () => {
        vi.mocked(Turno.count).mockResolvedValue(0)

        await existeTurnoEnHorario(2, '2026-12-01', '08:00')

        expect(Turno.count).toHaveBeenCalledWith({
            where: {
                agendaId: 2,
                fecha: '2026-12-01',
                hora: '08:00',
                estado: { [Op.ne]: 'CANCELADO' },
            },
        })
    })
})

describe('buscarTurnoPorId', () => {
    it('busca el turno por id incluyendo profesional y agenda', async () => {
        const turno = { id: 5 } as unknown as Turno
        vi.mocked(Turno.findByPk).mockResolvedValue(turno)

        const resultado = await buscarTurnoPorId(5)

        expect(Turno.findByPk).toHaveBeenCalledWith(
            5,
            expect.objectContaining({
                include: [
                    expect.objectContaining({ as: 'profesional' }),
                    expect.objectContaining({ as: 'agenda' }),
                ],
            }),
        )
        expect(resultado).toBe(turno)
    })
})

describe('listarTurnosDePaciente', () => {
    it('lista los turnos del paciente ordenados por fecha y hora descendente', async () => {
        vi.mocked(Turno.findAll).mockResolvedValue([])

        await listarTurnosDePaciente(10)

        expect(Turno.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { pacienteId: 10 },
                order: [
                    ['fecha', 'DESC'],
                    ['hora', 'DESC'],
                ],
            }),
        )
    })
})

describe('cancelarTurno', () => {
    it('cambia el estado a CANCELADO y guarda el turno', async () => {
        const turno = {
            estado: 'PENDIENTE',
            save: vi.fn().mockResolvedValue('guardado'),
        }

        const resultado = await cancelarTurno(turno as unknown as Turno)

        expect(turno.estado).toBe('CANCELADO')
        expect(turno.save).toHaveBeenCalled()
        expect(resultado).toBe('guardado')
    })
})
