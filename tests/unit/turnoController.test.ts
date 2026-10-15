import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'

import {
    cancelarMiTurno,
    obtenerMisTurnos,
    sacarTurno,
} from '../../src/controllers/turnoController.js'
import { buscarPacientePorUsuarioId } from '../../src/services/pacienteService.js'
import { listarTurnosDePaciente } from '../../src/services/turnoService.js'
import {
    cancelarTurnoDePaciente,
    reservarTurno,
} from '../../src/facades/reservaTurnoFacade.js'
import { MENSAJES } from '../../src/errors/mensajes.js'
import type { Paciente, Turno } from '../../src/models/index.js'

vi.mock('../../src/services/pacienteService.js', () => ({
    buscarPacientePorUsuarioId: vi.fn(),
}))

vi.mock('../../src/services/turnoService.js', () => ({
    listarTurnosDePaciente: vi.fn(),
}))

vi.mock('../../src/facades/reservaTurnoFacade.js', () => ({
    reservarTurno: vi.fn(),
    cancelarTurnoDePaciente: vi.fn(),
}))

const paciente = { id: 10 } as unknown as Paciente

const bodyValido = {
    profesionalId: 1,
    agendaId: 2,
    fecha: '2026-12-01',
    hora: '08:00',
    motivo: 'Consulta',
}

function crearRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    } as unknown as Response
}

interface ReqFalso {
    usuario?: { id: number } | undefined
    body?: Record<string, unknown>
    params?: Record<string, unknown>
}

function crearReq(overrides: ReqFalso = {}) {
    return {
        usuario: { id: 1 },
        body: {},
        params: {},
        ...overrides,
    } as unknown as Request
}

beforeEach(() => {
    vi.resetAllMocks()
})

describe('autenticación y paciente', () => {
    it('devuelve 401 si no hay usuario autenticado', async () => {
        const req = crearReq({ usuario: undefined })
        const esperado = {
            statusCode: 401,
            message: MENSAJES.AUTENTICACION_REQUERIDA,
        }

        await expect(obtenerMisTurnos(req, crearRes())).rejects.toMatchObject(
            esperado,
        )
        await expect(sacarTurno(req, crearRes())).rejects.toMatchObject(
            esperado,
        )
        await expect(cancelarMiTurno(req, crearRes())).rejects.toMatchObject(
            esperado,
        )
    })

    it('devuelve 404 si el paciente no existe', async () => {
        vi.mocked(buscarPacientePorUsuarioId).mockResolvedValue(null)

        await expect(
            obtenerMisTurnos(crearReq(), crearRes()),
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Paciente no encontrado',
        })
    })
})

describe('obtenerMisTurnos', () => {
    it('devuelve 200 con los turnos del paciente', async () => {
        vi.mocked(buscarPacientePorUsuarioId).mockResolvedValue(paciente)
        const turnos = [{ id: 1 }] as unknown as Turno[]
        vi.mocked(listarTurnosDePaciente).mockResolvedValue(turnos)
        const res = crearRes()

        await obtenerMisTurnos(crearReq(), res)

        expect(listarTurnosDePaciente).toHaveBeenCalledWith(10)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(turnos)
    })
})

describe('sacarTurno', () => {
    beforeEach(() => {
        vi.mocked(buscarPacientePorUsuarioId).mockResolvedValue(paciente)
    })

    it('devuelve 400 si el ID del profesional es inválido', async () => {
        for (const profesionalId of ['abc', 0, 1.5]) {
            await expect(
                sacarTurno(
                    crearReq({ body: { ...bodyValido, profesionalId } }),
                    crearRes(),
                ),
            ).rejects.toMatchObject({
                statusCode: 400,
                message:
                    'El ID del profesional debe ser un número entero positivo',
            })
        }
    })

    it('devuelve 400 si el ID de la agenda es inválido', async () => {
        await expect(
            sacarTurno(
                crearReq({ body: { ...bodyValido, agendaId: 'x' } }),
                crearRes(),
            ),
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'El ID de la agenda debe ser un número entero positivo',
        })
    })

    it('devuelve 400 si la fecha es inválida', async () => {
        for (const fecha of ['15-10-2026', '2026-02-31']) {
            await expect(
                sacarTurno(
                    crearReq({ body: { ...bodyValido, fecha } }),
                    crearRes(),
                ),
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'La fecha debe tener el formato YYYY-MM-DD',
            })
        }
    })

    it('devuelve 400 si la hora es inválida', async () => {
        for (const hora of ['8:00', '25:00', '08:60']) {
            await expect(
                sacarTurno(
                    crearReq({ body: { ...bodyValido, hora } }),
                    crearRes(),
                ),
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'La hora debe tener el formato HH:MM',
            })
        }
    })

    it('devuelve 400 si el motivo es vacío o demasiado largo', async () => {
        for (const motivo of ['', '   ', 'a'.repeat(256)]) {
            await expect(
                sacarTurno(
                    crearReq({ body: { ...bodyValido, motivo } }),
                    crearRes(),
                ),
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'El motivo debe tener entre 1 y 255 caracteres',
            })
        }
    })

    it('devuelve 400 si las observaciones no son texto', async () => {
        await expect(
            sacarTurno(
                crearReq({ body: { ...bodyValido, observaciones: 123 } }),
                crearRes(),
            ),
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'Las observaciones deben ser texto',
        })
    })

    it('crea el turno y responde 201', async () => {
        const turno = { id: 5 } as unknown as Turno
        vi.mocked(reservarTurno).mockResolvedValue(turno)
        const res = crearRes()

        await sacarTurno(
            crearReq({ body: { ...bodyValido, motivo: '  Consulta  ' } }),
            res,
        )

        expect(reservarTurno).toHaveBeenCalledWith({
            pacienteId: 10,
            profesionalId: 1,
            agendaId: 2,
            fecha: '2026-12-01',
            hora: '08:00',
            motivo: 'Consulta',
            observaciones: null,
        })
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(turno)
    })

    it('pasa las observaciones cuando se envían', async () => {
        vi.mocked(reservarTurno).mockResolvedValue({} as unknown as Turno)

        await sacarTurno(
            crearReq({
                body: { ...bodyValido, observaciones: 'Sin gluten' },
            }),
            crearRes(),
        )

        expect(reservarTurno).toHaveBeenCalledWith(
            expect.objectContaining({ observaciones: 'Sin gluten' }),
        )
    })
})

describe('cancelarMiTurno', () => {
    beforeEach(() => {
        vi.mocked(buscarPacientePorUsuarioId).mockResolvedValue(paciente)
    })

    it('devuelve 400 si el ID del turno es inválido', async () => {
        await expect(
            cancelarMiTurno(crearReq({ params: { id: 'abc' } }), crearRes()),
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'El ID del turno debe ser un número entero positivo',
        })
    })

    it('cancela el turno y responde 200', async () => {
        const turno = { id: 5 } as unknown as Turno
        vi.mocked(cancelarTurnoDePaciente).mockResolvedValue(turno)
        const res = crearRes()

        await cancelarMiTurno(crearReq({ params: { id: '5' } }), res)

        expect(cancelarTurnoDePaciente).toHaveBeenCalledWith(10, 5)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(turno)
    })
})
