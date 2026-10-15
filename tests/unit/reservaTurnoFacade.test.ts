import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    cancelarTurnoDePaciente,
    reservarTurno,
} from '../../src/facades/reservaTurnoFacade.js'
import { Agenda } from '../../src/models/index.js'
import type { Turno } from '../../src/models/index.js'
import {
    buscarTurnoPorId,
    cancelarTurno,
    crearTurno,
    existeTurnoEnHorario,
} from '../../src/services/turnoService.js'
import type { CrearTurno } from '../../src/types/CrearTurno.js'
import type { DiaSemana } from '../../src/types/DiaSemana.js'

vi.mock('../../src/models/index.js', () => ({
    Agenda: { findByPk: vi.fn() },
}))

vi.mock('../../src/services/turnoService.js', () => ({
    crearTurno: vi.fn(),
    existeTurnoEnHorario: vi.fn(),
    buscarTurnoPorId: vi.fn(),
    cancelarTurno: vi.fn(),
}))

const DIAS: DiaSemana[] = [
    'DOMINGO',
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
]

const HORA_EN_24_H = 24 * 60 * 60 * 1000

function formatearFecha(d: Date): string {
    const anio = d.getFullYear()
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${anio}-${mes}-${dia}`
}

function diaDeFecha(fecha: string): DiaSemana {
    const [anio = 0, mes = 1, dia = 1] = fecha.split('-').map(Number)
    return DIAS[new Date(anio, mes - 1, dia).getDay()] ?? 'DOMINGO'
}

function proximoFechaDe(dia: DiaSemana): string {
    for (let i = 1; i <= 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        if (DIAS[d.getDay()] === dia) {
            return formatearFecha(d)
        }
    }
    throw new Error(`No se encontró una fecha futura un ${dia}`)
}

function fechaPasadaDe(dia: DiaSemana): string {
    for (let i = 7; i <= 14; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        if (DIAS[d.getDay()] === dia) {
            return formatearFecha(d)
        }
    }
    throw new Error(`No se encontró una fecha pasada un ${dia}`)
}

// Construye fecha y hora con los componentes locales de la zona horaria,
// igual que hace el facade.
function fechaHoraDesde(ms: number): { fecha: string; hora: string } {
    const d = new Date(Date.now() + ms)
    const horas = String(d.getHours()).padStart(2, '0')
    const minutos = String(d.getMinutes()).padStart(2, '0')
    return { fecha: formatearFecha(d), hora: `${horas}:${minutos}` }
}

function agendaDe(fecha: string, overrides: Partial<Agenda> = {}) {
    return {
        id: 1,
        profesionalId: 1,
        diaSemana: diaDeFecha(fecha),
        horaInicio: '08:00',
        horaFin: '12:00',
        duracionTurno: 30,
        activo: true,
        ...overrides,
    }
}

function datosDe(fecha: string, hora = '08:00'): CrearTurno {
    return {
        pacienteId: 10,
        profesionalId: 1,
        agendaId: 1,
        fecha,
        hora,
        motivo: 'Consulta general',
    }
}

function turnoDe(overrides: Partial<Turno> = {}): Turno {
    const futuro = fechaHoraDesde(HORA_EN_24_H * 2)
    return {
        id: 5,
        pacienteId: 10,
        profesionalId: 1,
        agendaId: 1,
        fecha: futuro.fecha,
        hora: futuro.hora,
        estado: 'PENDIENTE',
        motivo: 'Consulta general',
        observaciones: null,
        ...overrides,
    } as unknown as Turno
}

beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(existeTurnoEnHorario).mockResolvedValue(false)
})

describe('reservarTurno', () => {
    it('devuelve 404 si la agenda no existe', async () => {
        vi.mocked(Agenda.findByPk).mockResolvedValue(null)

        await expect(
            reservarTurno(datosDe(proximoFechaDe('LUNES'))),
        ).rejects.toMatchObject({ statusCode: 404 })
    })

    it('devuelve 400 si la agenda no está activa', async () => {
        const fecha = proximoFechaDe('LUNES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha, { activo: false }) as unknown as Agenda,
        )

        await expect(reservarTurno(datosDe(fecha))).rejects.toMatchObject({
            statusCode: 400,
            message: 'La agenda no está activa',
        })
    })

    it('devuelve 400 si la agenda pertenece a otro profesional', async () => {
        const fecha = proximoFechaDe('LUNES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha, { profesionalId: 2 }) as unknown as Agenda,
        )

        await expect(reservarTurno(datosDe(fecha))).rejects.toMatchObject({
            statusCode: 400,
            message: 'La agenda no pertenece al profesional indicado',
        })
    })

    it('devuelve 400 si la fecha no es un día de atención', async () => {
        const fecha = proximoFechaDe('LUNES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha, { diaSemana: 'MARTES' }) as unknown as Agenda,
        )

        await expect(reservarTurno(datosDe(fecha))).rejects.toMatchObject({
            statusCode: 400,
            message:
                'La fecha no corresponde a un día de atención de la agenda',
        })
    })

    it('devuelve 400 si la fecha no existe en el calendario', async () => {
        const fecha = '2026-02-31'
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha) as unknown as Agenda,
        )

        await expect(reservarTurno(datosDe(fecha))).rejects.toMatchObject({
            statusCode: 400,
            message: 'La fecha no es válida',
        })
    })

    it('devuelve 400 si la hora está fuera del horario de atención', async () => {
        const fecha = proximoFechaDe('MARTES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha) as unknown as Agenda,
        )

        await expect(
            reservarTurno(datosDe(fecha, '13:00')),
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'La hora está fuera del horario de atención de la agenda',
        })
    })

    it('devuelve 400 si la hora no coincide con la duración del turno', async () => {
        const fecha = proximoFechaDe('MARTES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha) as unknown as Agenda,
        )

        await expect(
            reservarTurno(datosDe(fecha, '08:15')),
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'La hora no coincide con la duración del turno (30 min)',
        })
    })

    it('devuelve 400 si el turno está en el pasado', async () => {
        const fecha = fechaPasadaDe('MARTES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha) as unknown as Agenda,
        )

        await expect(reservarTurno(datosDe(fecha))).rejects.toMatchObject({
            statusCode: 400,
            message: 'No podés reservar un turno en el pasado',
        })
    })

    it('devuelve 409 si el horario ya está ocupado', async () => {
        const fecha = proximoFechaDe('MARTES')
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha) as unknown as Agenda,
        )
        vi.mocked(existeTurnoEnHorario).mockResolvedValue(true)

        await expect(reservarTurno(datosDe(fecha))).rejects.toMatchObject({
            statusCode: 409,
            message: 'El horario ya está ocupado',
        })
    })

    it('crea el turno cuando todas las validaciones pasan', async () => {
        const fecha = proximoFechaDe('MARTES')
        const datos = datosDe(fecha)
        const turnoCreado = turnoDe({ fecha, hora: '08:00' })
        vi.mocked(Agenda.findByPk).mockResolvedValue(
            agendaDe(fecha) as unknown as Agenda,
        )
        vi.mocked(crearTurno).mockResolvedValue(turnoCreado)

        const resultado = await reservarTurno(datos)

        expect(Agenda.findByPk).toHaveBeenCalledWith(1)
        expect(existeTurnoEnHorario).toHaveBeenCalledWith(
            1,
            datos.fecha,
            datos.hora,
        )
        expect(crearTurno).toHaveBeenCalledWith(datos)
        expect(resultado).toBe(turnoCreado)
    })
})

describe('cancelarTurnoDePaciente', () => {
    it('devuelve 404 si el turno no existe', async () => {
        vi.mocked(buscarTurnoPorId).mockResolvedValue(null)

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 404,
        })
    })

    it('devuelve 403 si el turno pertenece a otro paciente', async () => {
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ pacienteId: 99 }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 403,
            message: 'No podés cancelar un turno que no es tuyo',
        })
    })

    it('devuelve 409 si el turno ya está cancelado', async () => {
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ estado: 'CANCELADO' }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 409,
            message: 'El turno ya está cancelado',
        })
    })

    it('devuelve 409 si el turno ya fue atendido', async () => {
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ estado: 'ATENDIDO' }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 409,
            message: 'No se puede cancelar un turno ya atendido',
        })
    })

    it('devuelve 400 si el turno ya transcurrió', async () => {
        const pasado = fechaHoraDesde(-60 * 60 * 1000)
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ fecha: pasado.fecha, hora: pasado.hora }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 400,
            message: 'No podés cancelar un turno que ya empezó',
        })
    })

    it('devuelve 400 si faltan menos de 24 horas', async () => {
        const pronto = fechaHoraDesde(2 * 60 * 60 * 1000)
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ fecha: pronto.fecha, hora: pronto.hora }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 400,
            message: expect.stringContaining('24 horas'),
        })
    })

    it('devuelve 400 si la fecha del turno es inválida', async () => {
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ fecha: '2026-02-31' }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 400,
            message: 'La fecha no es válida',
        })
    })

    it('devuelve 400 si la hora del turno es inválida', async () => {
        vi.mocked(buscarTurnoPorId).mockResolvedValue(
            turnoDe({ hora: '25:00' }),
        )

        await expect(cancelarTurnoDePaciente(10, 5)).rejects.toMatchObject({
            statusCode: 400,
            message: 'La hora no es válida',
        })
    })

    it('cancela el turno cuando faltan más de 24 horas', async () => {
        const turno = turnoDe()
        vi.mocked(buscarTurnoPorId).mockResolvedValue(turno)
        vi.mocked(cancelarTurno).mockResolvedValue(
            turnoDe({ estado: 'CANCELADO' }),
        )

        const resultado = await cancelarTurnoDePaciente(10, 5)

        expect(cancelarTurno).toHaveBeenCalledWith(turno)
        expect(resultado.estado).toBe('CANCELADO')
    })
})
