import { Agenda } from '../models/index.js'
import { AppError } from '../errors/AppError.js'
import type { CrearTurno } from '../types/CrearTurno.js'
import type { DiaSemana } from '../types/DiaSemana.js'
import {
    crearTurno,
    existeTurnoEnHorario,
    buscarTurnoPorId,
    cancelarTurno,
} from './turnoService.js'

// Nombres de días alineados con el índice que devuelve Date.getUTCDay()
// (0 = domingo ... 6 = sábado), para mapear una fecha a un DiaSemana.
const DIAS_SEMANA: DiaSemana[] = [
    'DOMINGO',
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
]

// Anticipación mínima para poder cancelar un turno.
const MILISEGUNDOS_24_HORAS = 24 * 60 * 60 * 1000

/*
Convierte una hora en formato 'HH:MM' o 'HH:MM:SS' a la cantidad de minutos
transcurridos desde la medianoche, para poder comparar y validar rangos.
*/
function aMinutos(hora: string): number {
    const [horas = 0, minutos = 0] = hora.split(':').map(Number)

    return horas * 60 + minutos
}

/**
Combina una fecha 'YYYY-MM-DD' y una hora 'HH:MM' (o 'HH:MM:SS') en un
objeto Date, usado para comparar contra el momento actual.
*/
function construirFechaHora(fecha: string, hora: string): Date {
    return new Date(`${fecha}T${hora.slice(0, 5)}:00`)
}

/**
Devuelve el día de la semana ('LUNES', 'MARTES', ...) de una fecha
'YYYY-MM-DD'. Se calcula en UTC para evitar corrimientos de zona horaria.
*/
function diaSemanaDeFecha(fecha: string): DiaSemana {
    const indice = new Date(`${fecha}T00:00:00Z`).getUTCDay()

    return DIAS_SEMANA[indice] ?? 'DOMINGO'
}

/*
Maneja la creación de un turno para un paciente.
Valida, en orden, que la agenda exista y esté activa, que pertenezca al
profesional indicado, que la fecha caiga en un día de atención, que la hora
esté dentro del rango y alineada a la duración del turno, que no sea una
fecha pasada y que el horario esté libre. Finalmente delega la persistencia
en "turnoService".
*/
export async function reservarTurno(datos: CrearTurno) {
    const agenda = await Agenda.findByPk(datos.agendaId)

    if (!agenda) {
        throw new AppError(404, 'Agenda no encontrada')
    }

    if (!agenda.activo) {
        throw new AppError(400, 'La agenda no está activa')
    }

    // La agenda debe pertenecer al profesional con el que se reserva.
    if (agenda.profesionalId !== datos.profesionalId) {
        throw new AppError(
            400,
            'La agenda no pertenece al profesional indicado',
        )
    }

    // La fecha debe coincidir con un día de atención de la agenda.
    if (agenda.diaSemana !== diaSemanaDeFecha(datos.fecha)) {
        throw new AppError(
            400,
            'La fecha no corresponde a un día de atención de la agenda',
        )
    }

    const inicioMin = aMinutos(agenda.horaInicio)
    const finMin = aMinutos(agenda.horaFin)
    const horaMin = aMinutos(datos.hora)

    // La hora debe estar en el rango de atención.
    if (horaMin < inicioMin || horaMin >= finMin) {
        throw new AppError(
            400,
            'La hora está fuera del horario de atención de la agenda',
        )
    }

    // La hora debe caer exactamente en un múltiplo de la duración del turno.
    // Para que coincida (Ejemplo turnos: 8-8:30)
    if ((horaMin - inicioMin) % agenda.duracionTurno !== 0) {
        throw new AppError(
            400,
            `La hora no coincide con la duración del turno (${agenda.duracionTurno} min)`,
        )
    }

    // No permitir turnos en una fecha anterior al actual
    if (construirFechaHora(datos.fecha, datos.hora).getTime() < Date.now()) {
        throw new AppError(400, 'No podés reservar un turno en el pasado')
    }

    // Se comprueba que no haya otro turno activo en el mismo horario.
    const ocupado = await existeTurnoEnHorario(
        datos.agendaId,
        datos.fecha,
        datos.hora,
    )

    if (ocupado) {
        throw new AppError(409, 'El horario ya está ocupado')
    }

    return crearTurno(datos)
}

/*
Maneja la cancelación de un turno del propio paciente.
Verifica que el turno exista y pertenezca al paciente, que no esté ya
cancelado ni atendido y que falten al menos 24 horas (si falta
menos, la cancelación debe canalizarse por WhatsApp.
Y delega el cambio de estado en "turnoService".
*/
export async function cancelarTurnoDePaciente(
    pacienteId: number,
    turnoId: number,
) {
    const turno = await buscarTurnoPorId(turnoId)

    if (!turno) {
        throw new AppError(404, 'Turno no encontrado')
    }

    if (turno.pacienteId !== pacienteId) {
        throw new AppError(403, 'No podés cancelar un turno que no es tuyo')
    }

    if (turno.estado === 'CANCELADO') {
        throw new AppError(409, 'El turno ya está cancelado')
    }

    if (turno.estado === 'ATENDIDO') {
        throw new AppError(409, 'No se puede cancelar un turno ya atendido')
    }

    const falta =
        construirFechaHora(turno.fecha, turno.hora).getTime() - Date.now()

    // Debe existir al menos 24 h de anticipación.
    if (falta < MILISEGUNDOS_24_HORAS) {
        throw new AppError(
            400,
            'Solo podés cancelar con al menos 24 horas de anticipación. Contactanos por WhatsApp',
        )
    }

    return cancelarTurno(turno)
}
