import { Op } from 'sequelize'
import { Estudio, Paciente, AutorizacionEstudio, Profesional } from '../models/index.js'

export class EstudioService {
  // GET /api/estudios
  public static async listar() {
    return await Estudio.findAll({
      order: [['fecha', 'DESC']]
    })
  }

  // GET /api/estudios/:id
  public static async buscarPorId(id: number) {
    const estudio = await Estudio.findByPk(id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'dni']
        },
        {
          model: AutorizacionEstudio,
          as: 'autorizaciones',
          required: false,
          include: [
            {
              model: Profesional,
              as: 'profesional',
              attributes: ['id', 'nombre', 'apellido', 'especialidad']
            }
          ]
        }
      ]
    })

    if (!estudio) {
      throw new Error('Estudio no encontrado')
    }

    return estudio
  }

  // Consulta equivalente a "obtenerOcupacion": Obtiene el historial completo de un paciente con sus permisos
  public static async obtenerPorPaciente(pacienteId: number) {
    const estudios = await Estudio.findAll({
      where: { pacienteId },
      include: [
        {
          model: AutorizacionEstudio,
          as: 'autorizaciones',
          required: false,
          where: {
            estado: 'disponible',
            fechaVencimiento: {
              [Op.gte]: new Date() // Solo autorizaciones vigentes
            }
          },
          include: [
            {
              model: Profesional,
              as: 'profesional',
              attributes: ['id', 'nombre', 'apellido', 'especialidad']
            }
          ]
        }
      ],
      order: [['fecha', 'DESC']]
    })

    return estudios
  }

  // POST /api/estudios
  public static async crear(data: {
    pacienteId: number
    tipo: string
    fecha: Date
    descripcion: string
    archivoURL?: string
  }) {
    return await Estudio.create(data)
  }

  // PATCH/POST /api/estudios/:id/archivo 
  public static async adjuntarArchivo(id: number, archivoURL: string) {
    const estudio = await Estudio.findByPk(id)

    if (!estudio) {
      throw new Error('Estudio no encontrado')
    }

    // Renueva del método de modelo / actualización en BD
    return await estudio.update({ archivoURL })
  }

  // PUT /api/estudios/:id/archivo 
  public static async actualizarArchivo(id: number, archivoURL: string) {
    const estudio = await Estudio.findByPk(id)

    if (!estudio) {
      throw new Error('Estudio no encontrado')
    }

    return await estudio.update({ archivoURL })
  }
}

export default EstudioService